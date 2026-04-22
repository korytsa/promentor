import { Injectable } from "@nestjs/common";
import { CoachingTeamStatus, PrismaClient, UserRole } from "@prisma/client";

type DashboardMetrics = {
  teams: number;
  mentors: number;
  interns: number;
  boards: number;
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaClient) {}

  async getMetrics(): Promise<DashboardMetrics> {
    const [teams, mentors, interns, boards] = await this.prisma.$transaction([
      this.prisma.coachingTeam.count({
        where: { status: CoachingTeamStatus.ACTIVE },
      }),
      this.prisma.user.count({ where: { role: UserRole.MENTOR } }),
      this.prisma.user.count({ where: { role: UserRole.REGULAR_USER } }),
      this.prisma.tacticalBoard.count(),
    ]);

    return { teams, mentors, interns, boards };
  }
}
