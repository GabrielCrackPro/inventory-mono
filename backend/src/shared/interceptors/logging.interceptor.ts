import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { CustomLogger } from '../utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new CustomLogger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const statusCode = response?.statusCode;
        this.logger.log(`${method} ${url} ${statusCode} - ${duration}ms`);
      }),
    );
  }
}
