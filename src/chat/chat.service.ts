import { Injectable, Logger } from '@nestjs/common';
import { N8nService } from '../n8n/n8n.service';
import { N8nWebhookResponse } from '../n8n/interfaces/n8n-webhook-response.interface';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ChatRequestDto } from './dto/chat-request.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly n8nService: N8nService) {}

  async sendPrompt(
    user: AuthenticatedUser,
    dto: ChatRequestDto,
  ): Promise<N8nWebhookResponse> {
    this.logger.log(
      `User ${user.id} sending chat prompt (sessionId: ${user.id})`,
    );

    return this.n8nService.sendChat(dto.prompt, user.id);
  }
}
