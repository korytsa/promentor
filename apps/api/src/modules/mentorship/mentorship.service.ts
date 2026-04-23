import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CoachingTeamStatus,
  MentorshipRequestStatus,
  PrismaClient,
  UserRole,
} from "@prisma/client";
import { CreateMentorshipRequestDto } from "./dto/create-mentorship-request.dto";
import type { MentorExploreRowResponse } from "./types/mentor-explore-row.type";
import type { MentorshipRequestInboxItemResponse } from "./types/mentorship-request-inbox-response.type";

const DISPLAY_NAME_SORT_LOCALE = "en" as const;

function compareDisplayNames(a: string, b: string): number {
  return a.localeCompare(b, DISPLAY_NAME_SORT_LOCALE, { sensitivity: "base" });
}

@Injectable()
export class MentorshipService {
  constructor(private readonly prisma: PrismaClient) {}

  private sortIdLabelsByLabel(
    items: { id: string; label: string }[],
  ): { id: string; label: string }[] {
    return [...items].sort((a, b) => compareDisplayNames(a.label, b.label));
  }

  async listAcceptedMentorLabelsForMentee(
    menteeId: string,
  ): Promise<{ id: string; label: string }[]> {
    const rows = await this.prisma.mentorshipRequest.findMany({
      where: {
        menteeId,
        status: MentorshipRequestStatus.ACCEPTED,
      },
      select: {
        mentor: { select: { id: true, fullName: true } },
      },
    });
    return this.sortIdLabelsByLabel(
      rows.map((r) => ({ id: r.mentor.id, label: r.mentor.fullName })),
    );
  }

  async listAcceptedMenteeLabelsForMentor(
    mentorId: string,
  ): Promise<{ id: string; label: string }[]> {
    const rows = await this.prisma.mentorshipRequest.findMany({
      where: {
        mentorId,
        status: MentorshipRequestStatus.ACCEPTED,
      },
      select: {
        mentee: { select: { id: true, fullName: true } },
      },
    });
    return this.sortIdLabelsByLabel(
      rows.map((r) => ({ id: r.mentee.id, label: r.mentee.fullName })),
    );
  }

  private availabilityLabel(
    tier: "HIGH" | "MEDIUM" | "LOW" | null,
  ): "High" | "Medium" | "Low" {
    if (tier === "HIGH") return "High";
    if (tier === "LOW") return "Low";
    return "Medium";
  }

  async listMentorsForViewer(
    viewerId: string,
    viewerRole: UserRole,
  ): Promise<MentorExploreRowResponse[]> {
    const mentors = await this.prisma.user.findMany({
      where: {
        role: UserRole.MENTOR,
        id: { not: viewerId },
      },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        jobTitle: true,
        mentorAvailability: true,
        mentorWeeklySessions: true,
        coachingTeamsCreated: {
          where: { status: CoachingTeamStatus.ACTIVE },
          select: { name: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { fullName: "asc" },
    });

    let requestMetaByMentorId = new Map<
      string,
      { status: MentorshipRequestStatus; id: string }
    >();
    if (viewerRole === UserRole.REGULAR_USER && mentors.length > 0) {
      const rows = await this.prisma.mentorshipRequest.findMany({
        where: {
          menteeId: viewerId,
          mentorId: { in: mentors.map((m) => m.id) },
        },
        select: { id: true, mentorId: true, status: true },
      });
      requestMetaByMentorId = new Map(
        rows.map((r) => [r.mentorId, { status: r.status, id: r.id }]),
      );
    }

    return mentors.map((m) => {
      const meta = requestMetaByMentorId.get(m.id);
      return {
        id: m.id,
        fullName: m.fullName,
        avatarUrl: m.avatarUrl,
        jobTitle: m.jobTitle,
        availabilityLabel: this.availabilityLabel(m.mentorAvailability),
        sessionsThisWeek: m.mentorWeeklySessions,
        linkedTeams: m.coachingTeamsCreated.map((t) => t.name),
        requestStatus:
          viewerRole === UserRole.MENTOR ? "NONE" : (meta?.status ?? "NONE"),
        mentorshipRequestId:
          viewerRole === UserRole.MENTOR ? null : (meta?.id ?? null),
      };
    });
  }

  async createMentorshipRequest(
    menteeId: string,
    dto: CreateMentorshipRequestDto,
  ): Promise<{ id: string; status: MentorshipRequestStatus }> {
    const mentee = await this.prisma.user.findUnique({
      where: { id: menteeId },
      select: { role: true },
    });

    if (!mentee || mentee.role !== UserRole.REGULAR_USER) {
      throw new ForbiddenException(
        "Only regular users can send mentorship requests",
      );
    }

    const mentor = await this.prisma.user.findUnique({
      where: { id: dto.mentorId },
      select: { id: true, role: true },
    });

    if (!mentor || mentor.role !== UserRole.MENTOR) {
      throw new NotFoundException("Mentor not found");
    }

    if (mentor.id === menteeId) {
      throw new BadRequestException(
        "You cannot request mentorship from yourself",
      );
    }

    const message = dto.message?.trim() ? dto.message.trim() : null;

    const existing = await this.prisma.mentorshipRequest.findUnique({
      where: {
        mentorId_menteeId: { mentorId: dto.mentorId, menteeId },
      },
    });

    if (existing?.status === MentorshipRequestStatus.PENDING) {
      throw new ConflictException("A mentorship request is already pending");
    }

    if (existing?.status === MentorshipRequestStatus.ACCEPTED) {
      throw new ConflictException(
        "Mentorship is already active; remove it before sending a new request",
      );
    }

    if (existing?.status === MentorshipRequestStatus.REJECTED) {
      const updated = await this.prisma.mentorshipRequest.update({
        where: { id: existing.id },
        data: {
          status: MentorshipRequestStatus.PENDING,
          message,
        },
        select: { id: true, status: true },
      });
      return updated;
    }

    return this.prisma.mentorshipRequest.create({
      data: {
        mentorId: dto.mentorId,
        menteeId,
        message,
        status: MentorshipRequestStatus.PENDING,
      },
      select: { id: true, status: true },
    });
  }

  async listReceivedMentorshipRequests(
    mentorId: string,
  ): Promise<MentorshipRequestInboxItemResponse[]> {
    const rows = await this.prisma.mentorshipRequest.findMany({
      where: { mentorId },
      include: {
        mentee: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return rows.map((r) => ({
      id: r.id,
      mentorId: r.mentorId,
      menteeId: r.mentee.id,
      menteeName: r.mentee.fullName,
      menteeAvatarUrl: r.mentee.avatarUrl,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async decideMentorshipRequest(
    mentorId: string,
    requestId: string,
    action: "accept" | "reject",
  ): Promise<void> {
    const request = await this.prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException("Mentorship request not found");
    }

    if (request.mentorId !== mentorId) {
      throw new ForbiddenException(
        "You can only decide requests addressed to you",
      );
    }

    if (request.status !== MentorshipRequestStatus.PENDING) {
      throw new ConflictException("This request is no longer pending");
    }

    await this.prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: {
        status:
          action === "accept"
            ? MentorshipRequestStatus.ACCEPTED
            : MentorshipRequestStatus.REJECTED,
      },
    });
  }

  async deleteMentorshipRequestAsMentee(
    menteeId: string,
    requestId: string,
  ): Promise<void> {
    const request = await this.prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException("Mentorship request not found");
    }

    if (request.menteeId !== menteeId) {
      throw new ForbiddenException("You can only manage your own requests");
    }

    if (
      request.status !== MentorshipRequestStatus.PENDING &&
      request.status !== MentorshipRequestStatus.ACCEPTED
    ) {
      throw new ConflictException("This request cannot be withdrawn");
    }

    await this.prisma.mentorshipRequest.delete({ where: { id: requestId } });
  }
}
