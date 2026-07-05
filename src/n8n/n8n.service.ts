import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import FormData = require('form-data');
import { firstValueFrom } from 'rxjs';
import { N8nWebhookResponse } from './interfaces/n8n-webhook-response.interface';

@Injectable()
export class N8nService {
  private readonly logger = new Logger(N8nService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendDocument(file: Express.Multer.File): Promise<N8nWebhookResponse> {
    const webhookUrl = this.configService.getOrThrow<string>(
      'N8N_DOCUMENT_WEBHOOK',
    );

    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    return this.executeWebhook('POST /documents', webhookUrl, {
      data: formData,
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
  }

  async sendChat(prompt: string): Promise<N8nWebhookResponse> {
    const webhookUrl = this.configService.getOrThrow<string>('N8N_CHAT_WEBHOOK');

    return this.executeWebhook('POST /chat', webhookUrl, {
      data: { prompt },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async executeWebhook(
    endpoint: string,
    url: string,
    config: {
      data: unknown;
      headers: Record<string, string>;
      maxBodyLength?: number;
      maxContentLength?: number;
    },
  ): Promise<N8nWebhookResponse> {
    const startTime = Date.now();

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, config.data, {
          headers: config.headers,
          maxBodyLength: config.maxBodyLength,
          maxContentLength: config.maxContentLength,
          validateStatus: () => true,
        }),
      );

      const duration = Date.now() - startTime;

      this.logger.log(
        `[${endpoint}] n8n webhook responded with status ${response.status} in ${duration}ms`,
      );
      this.logger.debug(
        `[${endpoint}] n8n webhook response: ${JSON.stringify(response.data)}`,
      );

      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = this.extractErrorMessage(error);

      this.logger.error(
        `[${endpoint}] n8n webhook failed in ${duration}ms - ${message}`,
      );

      throw new InternalServerErrorException(
        'Failed to communicate with processing service',
      );
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}
