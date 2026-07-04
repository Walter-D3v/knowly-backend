import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { ChatModule } from './chat/chat.module';
import { N8nModule } from './n8n/n8n.module';

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
    N8nModule,
    DocumentsModule,
    ChatModule,
  ],
})
export class AppModule {}
