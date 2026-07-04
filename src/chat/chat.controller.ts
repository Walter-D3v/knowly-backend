import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(200)
  async sendChat(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChatRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<unknown> {
    const webhookResponse = await this.chatService.sendPrompt(user, dto);

    res.status(webhookResponse.status);
    return webhookResponse.data;
  }
}
