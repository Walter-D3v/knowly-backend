import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AuthenticatedRequest } from '../decorators/current-user.decorator';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const userId = (request as AuthenticatedRequest).user?.id ?? 'anonymous';
    const startTime = Date.now();

    this.logger.log(`[${method}] ${url} - user: ${userId}`);

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${method}] ${url} - completed in ${duration}ms - user: ${userId}`,
          );
          this.logger.debug(
            `[${method}] ${url} - response: ${JSON.stringify(response)}`,
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${method}] ${url} - failed in ${duration}ms - user: ${userId} - ${error.message}`,
          );
        },
      }),
    );
  }
}
