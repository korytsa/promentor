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
import { RegularUserGuard } from "../auth/guards/regular-user.guard";
import type { JwtPayload } from "../auth/types/jwt-payload.type";
import { CreateUserBoardDto } from "./dto/create-user-board.dto";
import { CreateUserSuggestionDto } from "./dto/create-user-suggestion.dto";
import { UpdateUserSuggestionDto } from "./dto/update-user-suggestion.dto";
import { SuggestionsService } from "./suggestions.service";
import type {
  SuggestionBoardTargetRow,
  SuggestionMentorTargetRow,
  UserSuggestionInboxItem,
  UserSuggestionSentItem,
} from "./types/suggestion-api.types";

@Controller("user-suggestions")
@UseGuards(JwtAuthGuard)
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Get("received")
  @UseGuards(MentorGuard)
  listReceived(
    @CurrentUser() user: JwtPayload,
  ): Promise<UserSuggestionInboxItem[]> {
    return this.suggestionsService.listReceivedForMentor(user.sub);
  }

  @Get("mentor-targets/mentors")
  @UseGuards(RegularUserGuard)
  listMentorTargets(
    @CurrentUser() user: JwtPayload,
  ): Promise<SuggestionMentorTargetRow[]> {
    return this.suggestionsService.listMentorTargets(user.sub);
  }

  @Get("mentor-targets/boards")
  @UseGuards(RegularUserGuard)
  listBoardTargets(
    @CurrentUser() user: JwtPayload,
  ): Promise<SuggestionBoardTargetRow[]> {
    return this.suggestionsService.listBoardTargets(user.sub);
  }

  @Post("mentor-targets/boards")
  @UseGuards(RegularUserGuard)
  createBoard(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateUserBoardDto,
  ): Promise<SuggestionBoardTargetRow> {
    return this.suggestionsService.createUserBoard(user.sub, dto);
  }

  @Get()
  @UseGuards(RegularUserGuard)
  listMy(@CurrentUser() user: JwtPayload): Promise<UserSuggestionSentItem[]> {
    return this.suggestionsService.listMySuggestions(user.sub);
  }

  @Post()
  @UseGuards(RegularUserGuard)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateUserSuggestionDto,
  ): Promise<UserSuggestionSentItem> {
    return this.suggestionsService.createSuggestion(user.sub, dto);
  }

  @Patch(":id")
  @UseGuards(RegularUserGuard)
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateUserSuggestionDto,
  ): Promise<UserSuggestionSentItem> {
    return this.suggestionsService.updateSuggestion(user.sub, id, dto);
  }

  @Delete(":id")
  @UseGuards(RegularUserGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
  ): Promise<void> {
    await this.suggestionsService.deleteSuggestion(user.sub, id);
  }
}
