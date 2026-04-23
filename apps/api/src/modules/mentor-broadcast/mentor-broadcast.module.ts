import { Module } from "@nestjs/common";
import { MentorshipModule } from "../mentorship/mentorship.module";
import { PrismaModule } from "../prisma/prisma.module";
import { MentorBroadcastController } from "./mentor-broadcast.controller";
import { MentorBroadcastService } from "./mentor-broadcast.service";

@Module({
  imports: [PrismaModule, MentorshipModule],
  controllers: [MentorBroadcastController],
  providers: [MentorBroadcastService],
})
export class MentorBroadcastModule {}
