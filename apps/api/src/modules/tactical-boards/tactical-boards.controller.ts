import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MentorGuard } from "../auth/guards/mentor.guard";
import { JwtPayload } from "../auth/types/jwt-payload.type";
import { CreateTacticalBoardDto } from "./dto/create-tactical-board.dto";
import { UpdateTacticalBoardDto } from "./dto/update-tactical-board.dto";
import { TacticalBoardsService } from "./tactical-boards.service";
import { TacticalBoardResponse } from "./types/tactical-board-response.type";

@UseGuards(JwtAuthGuard)
@Controller("tactical-boards")
export class TacticalBoardsController {
  constructor(private readonly tacticalBoardsService: TacticalBoardsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload): Promise<TacticalBoardResponse[]> {
    return this.tacticalBoardsService.listForUser(user.sub, user.role);
  }

  @Get(":id")
  getOne(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<TacticalBoardResponse> {
    return this.tacticalBoardsService.getById(id, user.sub, user.role);
  }

  @Post()
  @UseGuards(MentorGuard)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTacticalBoardDto,
  ): Promise<TacticalBoardResponse> {
    return this.tacticalBoardsService.create(user.sub, dto);
  }

  @Patch(":id")
  @UseGuards(MentorGuard)
  update(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTacticalBoardDto,
  ): Promise<TacticalBoardResponse> {
    return this.tacticalBoardsService.update(id, user.sub, dto);
  }

  @Delete(":id")
  @UseGuards(MentorGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.tacticalBoardsService.remove(id, user.sub);
  }
}
