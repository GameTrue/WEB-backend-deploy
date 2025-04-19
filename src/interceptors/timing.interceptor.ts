import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();
    const requestUrl = request.url;
    const method = request.method;

    const now = Date.now();

    return next.handle().pipe(
      map((data) => {
        const elapsedTime = Date.now() - now;
        
        response.setHeader('X-Elapsed-Time', `${elapsedTime}ms`);

        this.logger.log(`${method} ${requestUrl} - ${elapsedTime}ms`);

        return data;
      })
    );
  }
}