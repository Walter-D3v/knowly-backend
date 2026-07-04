import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { N8nService } from '../n8n/n8n.service';
import { N8nWebhookResponse } from '../n8n/interfaces/n8n-webhook-response.interface';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private readonly n8nService: N8nService) {}

  async uploadDocument(
    user: AuthenticatedUser,
    file?: Express.Multer.File,
  ): Promise<N8nWebhookResponse> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    this.logger.log(
      `User ${user.id} uploading document: ${file.originalname}`,
    );

    return this.n8nService.sendDocument(file);
  }
}
