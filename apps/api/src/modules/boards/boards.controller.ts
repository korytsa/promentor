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
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { BoardsService } from "./boards.service";
import { BoardResponse } from "./types/board-response.type";

@UseGuards(JwtAuthGuard)
@Controller("boards")
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload): Promise<BoardResponse[]> {
    return this.boardsService.listForUser(user.sub, user.role);
  }

  @Get(":id")
  getOne(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BoardResponse> {
    return this.boardsService.getById(id, user.sub, user.role);
  }

  @Post()
  @UseGuards(MentorGuard)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBoardDto,
  ): Promise<BoardResponse> {
    return this.boardsService.create(user.sub, dto);
  }

  @Patch(":id")
  @UseGuards(MentorGuard)
  update(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateBoardDto,
  ): Promise<BoardResponse> {
    return this.boardsService.update(id, user.sub, dto);
  }

  @Delete(":id")
  @UseGuards(MentorGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.boardsService.remove(id, user.sub);
  }
}
