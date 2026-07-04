import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { N8nModule } from '../n8n/n8n.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [AuthModule, N8nModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
