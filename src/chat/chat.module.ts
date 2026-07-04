import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { N8nModule } from '../n8n/n8n.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [AuthModule, N8nModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
