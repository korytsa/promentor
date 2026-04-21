import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CoachingTeamJoinRequestStatus,
  CoachingTeamStatus,
  Prisma,
  PrismaClient,
  UserRole,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { CreateTeamJoinRequestDto } from "./dto/create-team-join-request.dto";
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
import type {
  ExploreJoinUi,
  ExploreTeamRowResponse,
} from "./types/coaching-team-explore-response.type";
import type { TeamJoinRequestInboxItemResponse } from "./types/team-join-request-inbox-response.type";
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

  async exploreTeams(
    userId: string,
    role: UserRole,
  ): Promise<ExploreTeamRowResponse[]> {
    const rows = await this.prisma.coachingTeam.findMany({
      orderBy: { updatedAt: "desc" },
      include: COACHING_TEAM_LIST_INCLUDE,
    });

    if (rows.length === 0) {
      return [];
    }

    const teamIds = rows.map((r) => r.id);
    const [memberships, joinReqRows] = await Promise.all([
      this.prisma.coachingTeamMember.findMany({
        where: { userId, teamId: { in: teamIds } },
        select: { teamId: true },
      }),
      this.prisma.coachingTeamJoinRequest.findMany({
        where: { requesterId: userId, teamId: { in: teamIds } },
        select: { teamId: true, status: true },
      }),
    ]);

    const memberOf = new Set(memberships.map((m) => m.teamId));
    const joinStatusByTeam = new Map(
      joinReqRows.map((j) => [j.teamId, j.status] as const),
    );

    return rows.map((row) => {
      const base = toCoachingTeamListItem(row);
      let joinUi: ExploreJoinUi;
      const jr = joinStatusByTeam.get(row.id);
      if (row.createdById === userId) {
        joinUi = "your_team";
      } else if (memberOf.has(row.id)) {
        joinUi = "joined";
      } else if (jr === CoachingTeamJoinRequestStatus.PENDING) {
        joinUi = "pending";
      } else if (
        jr === CoachingTeamJoinRequestStatus.REJECTED ||
        jr === CoachingTeamJoinRequestStatus.ACCEPTED
      ) {
        joinUi = "declined";
      } else if (role === UserRole.REGULAR_USER) {
        joinUi = "send_request";
      } else {
        joinUi = "ineligible";
      }
      return { ...base, joinUi };
    });
  }

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
        const previousMembers = await tx.coachingTeamMember.findMany({
          where: { teamId },
          select: { userId: true },
        });
        const prev = new Set(previousMembers.map((m) => m.userId));
        const next = new Set(memberIds);
        const removedUserIds = [...prev].filter((uid) => !next.has(uid));

        await tx.coachingTeamMember.deleteMany({ where: { teamId } });
        await tx.coachingTeamMember.createMany({
          data: memberIds.map((userId) => ({
            teamId,
            userId,
          })),
        });

        if (removedUserIds.length > 0) {
          await tx.coachingTeamJoinRequest.updateMany({
            where: {
              teamId,
              requesterId: { in: removedUserIds },
              status: CoachingTeamJoinRequestStatus.ACCEPTED,
            },
            data: { status: CoachingTeamJoinRequestStatus.REJECTED },
          });
        }
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

  async createJoinRequest(
    requesterId: string,
    teamId: string,
    dto: CreateTeamJoinRequestDto,
  ): Promise<{ id: string; status: CoachingTeamJoinRequestStatus }> {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true },
    });

    if (!requester || requester.role !== UserRole.REGULAR_USER) {
      throw new ForbiddenException(
        "Only regular users can request to join teams",
      );
    }

    const team = await this.prisma.coachingTeam.findUnique({
      where: { id: teamId },
      select: { id: true, createdById: true },
    });

    if (!team) {
      throw new NotFoundException("Team not found");
    }

    if (team.createdById === requesterId) {
      throw new BadRequestException("You cannot request to join your own team");
    }

    const membership = await this.prisma.coachingTeamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId: requesterId },
      },
      select: { teamId: true },
    });

    if (membership) {
      throw new ConflictException("You are already a member of this team");
    }

    const message = dto.message?.trim() ? dto.message.trim() : null;

    const existing = await this.prisma.coachingTeamJoinRequest.findUnique({
      where: {
        teamId_requesterId: { teamId, requesterId },
      },
    });

    if (existing?.status === CoachingTeamJoinRequestStatus.PENDING) {
      throw new ConflictException("A join request is already pending");
    }

    if (existing?.status === CoachingTeamJoinRequestStatus.ACCEPTED) {
      const updated = await this.prisma.coachingTeamJoinRequest.update({
        where: { id: existing.id },
        data: {
          status: CoachingTeamJoinRequestStatus.PENDING,
          message,
        },
        select: { id: true, status: true },
      });
      return updated;
    }

    if (existing?.status === CoachingTeamJoinRequestStatus.REJECTED) {
      const updated = await this.prisma.coachingTeamJoinRequest.update({
        where: { id: existing.id },
        data: {
          status: CoachingTeamJoinRequestStatus.PENDING,
          message,
        },
        select: { id: true, status: true },
      });
      return updated;
    }

    const created = await this.prisma.coachingTeamJoinRequest.create({
      data: {
        teamId,
        requesterId,
        message,
        status: CoachingTeamJoinRequestStatus.PENDING,
      },
      select: { id: true, status: true },
    });

    return created;
  }

  async listReceivedJoinRequests(
    mentorId: string,
  ): Promise<TeamJoinRequestInboxItemResponse[]> {
    const rows = await this.prisma.coachingTeamJoinRequest.findMany({
      where: {
        team: { createdById: mentorId },
      },
      include: {
        team: { select: { id: true, name: true } },
        requester: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return rows.map((r) => ({
      id: r.id,
      teamId: r.team.id,
      teamName: r.team.name,
      requesterId: r.requester.id,
      requesterName: r.requester.fullName,
      requesterAvatarUrl: r.requester.avatarUrl,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async decideJoinRequest(
    mentorId: string,
    requestId: string,
    action: "accept" | "reject",
  ): Promise<void> {
    const request = await this.prisma.coachingTeamJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        team: { select: { id: true, createdById: true } },
      },
    });

    if (!request) {
      throw new NotFoundException("Join request not found");
    }

    if (request.team.createdById !== mentorId) {
      throw new ForbiddenException(
        "You can only decide requests for your teams",
      );
    }

    if (request.status !== CoachingTeamJoinRequestStatus.PENDING) {
      throw new ConflictException("This request is no longer pending");
    }

    if (action === "reject") {
      await this.prisma.coachingTeamJoinRequest.update({
        where: { id: requestId },
        data: { status: CoachingTeamJoinRequestStatus.REJECTED },
      });
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.coachingTeamMember.create({
        data: {
          teamId: request.teamId,
          userId: request.requesterId,
        },
      });

      await tx.coachingTeamJoinRequest.update({
        where: { id: requestId },
        data: { status: CoachingTeamJoinRequestStatus.ACCEPTED },
      });
    });
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
