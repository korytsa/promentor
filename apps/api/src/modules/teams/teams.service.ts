import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CoachingTeamStatus,
  Prisma,
  PrismaClient,
  UserRole,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { InviteRegularUserDto } from "./dto/invite-regular-user.dto";
import { CreateTeamDto } from "./dto/create-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { generateInvitePassword } from "./utils/generate-invite-password.util";
import {
  COACHING_TEAM_LIST_INCLUDE,
  CoachingTeamDetailResponse,
  CoachingTeamListItemResponse,
  toCoachingTeamListItem,
} from "./types/coaching-team-response.type";
import {
  toUserResponse,
  USER_RESPONSE_SELECT,
  UserResponse,
} from "../users/types/user-response.type";

const BCRYPT_SALT_ROUNDS = 12;
const MIN_TEAM_MEMBERS = 2;

const TEAM_DETAIL_SELECT = {
  id: true,
  name: true,
  status: true,
  createdById: true,
  members: {
    orderBy: { joinedAt: "asc" as const },
    select: {
      user: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
    },
  },
} as const;

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaClient) {}

  async listTeams(
    userId: string,
    role: UserRole,
  ): Promise<CoachingTeamListItemResponse[]> {
    const where: Prisma.CoachingTeamWhereInput =
      role === UserRole.MENTOR
        ? { createdById: userId }
        : { members: { some: { userId } } };

    const rows = await this.prisma.coachingTeam.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: COACHING_TEAM_LIST_INCLUDE,
    });

    return rows.map(toCoachingTeamListItem);
  }

  async getTeamById(
    teamId: string,
    userId: string,
  ): Promise<CoachingTeamDetailResponse> {
    const team = await this.prisma.coachingTeam.findUnique({
      where: { id: teamId },
      select: TEAM_DETAIL_SELECT,
    });

    if (!team) {
      throw new NotFoundException("Team not found");
    }

    const isOwner = team.createdById === userId;
    const isMember = team.members.some((m) => m.user.id === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException("You cannot view this team");
    }

    return {
      id: team.id,
      name: team.name,
      status: team.status,
      members: team.members.map((m) => ({
        id: m.user.id,
        fullName: m.user.fullName,
        avatarUrl: m.user.avatarUrl,
      })),
    };
  }

  async createTeam(
    mentorId: string,
    dto: CreateTeamDto,
  ): Promise<CoachingTeamListItemResponse> {
    const memberIds = this.uniqueMemberUserIds(dto.memberUserIds);
    this.assertMinimumTeamMembers(memberIds);
    await this.assertRegularMemberIds(memberIds);

    const created = await this.prisma.$transaction(async (tx) => {
      const team = await tx.coachingTeam.create({
        data: {
          name: dto.name.trim(),
          status: CoachingTeamStatus.ACTIVE,
          createdById: mentorId,
          members: {
            createMany: {
              data: memberIds.map((userId) => ({ userId })),
            },
          },
        },
        include: COACHING_TEAM_LIST_INCLUDE,
      });
      return team;
    });

    return toCoachingTeamListItem(created);
  }

  async updateTeam(
    mentorId: string,
    teamId: string,
    dto: UpdateTeamDto,
  ): Promise<CoachingTeamListItemResponse> {
    await this.assertMentorOwnsTeam(teamId, mentorId, "edit");

    let memberIds: string[] | undefined;
    if (dto.memberUserIds !== undefined) {
      memberIds = this.uniqueMemberUserIds(dto.memberUserIds);
      this.assertMinimumTeamMembers(memberIds);
      await this.assertRegularMemberIds(memberIds);
    }

    if (dto.name === undefined && dto.memberUserIds === undefined) {
      throw new BadRequestException(
        "At least one of name or memberUserIds must be provided",
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (memberIds) {
        await tx.coachingTeamMember.deleteMany({ where: { teamId } });
        await tx.coachingTeamMember.createMany({
          data: memberIds.map((userId) => ({
            teamId,
            userId,
          })),
        });
      }

      if (dto.name !== undefined) {
        await tx.coachingTeam.update({
          where: { id: teamId },
          data: { name: dto.name.trim() },
        });
      }

      return tx.coachingTeam.findUniqueOrThrow({
        where: { id: teamId },
        include: COACHING_TEAM_LIST_INCLUDE,
      });
    });

    return toCoachingTeamListItem(updated);
  }

  async deleteTeam(mentorId: string, teamId: string): Promise<void> {
    await this.assertMentorOwnsTeam(teamId, mentorId, "delete");
    await this.prisma.coachingTeam.delete({ where: { id: teamId } });
  }

  async inviteRegularUser(dto: InviteRegularUserDto): Promise<UserResponse> {
    const email = dto.email.trim().toLowerCase();
    const fullName = dto.fullName.trim();

    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await hash(
      generateInvitePassword(),
      BCRYPT_SALT_ROUNDS,
    );

    const created = await this.prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: UserRole.REGULAR_USER,
      },
      select: USER_RESPONSE_SELECT,
    });

    return toUserResponse(created);
  }

  private async assertMentorOwnsTeam(
    teamId: string,
    mentorId: string,
    action: "edit" | "delete",
  ): Promise<void> {
    const team = await this.prisma.coachingTeam.findUnique({
      where: { id: teamId },
      select: { createdById: true },
    });

    if (!team) {
      throw new NotFoundException("Team not found");
    }

    if (team.createdById !== mentorId) {
      throw new ForbiddenException(`You can only ${action} teams you created`);
    }
  }

  private uniqueMemberUserIds(memberUserIds: string[]): string[] {
    return [...new Set(memberUserIds)];
  }

  private assertMinimumTeamMembers(memberIds: string[]): void {
    if (memberIds.length < MIN_TEAM_MEMBERS) {
      throw new BadRequestException(
        `A team must have at least ${MIN_TEAM_MEMBERS} members`,
      );
    }
  }

  private async assertRegularMemberIds(memberIds: string[]): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, role: true },
    });

    if (users.length !== memberIds.length) {
      throw new BadRequestException("One or more members were not found");
    }

    const invalid = users.filter((u) => u.role !== UserRole.REGULAR_USER);
    if (invalid.length > 0) {
      throw new BadRequestException(
        "Team members must be regular users (mentors cannot be added as members)",
      );
    }
  }
}
