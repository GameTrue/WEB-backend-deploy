import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class EtagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    // Process only GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      map(data => {
        if (!data || data instanceof Buffer) {
          return data;
        }

        const acceptHeader = request.headers['accept'] || '';
        const dataString = JSON.stringify(data) + acceptHeader;
        const etag = crypto.createHash('md5').update(dataString).digest('hex');
        
        response.setHeader('ETag', `"${etag}"`);

        

        if ((request.url.includes('/api/') || request.method === 'GET') && !request.url.includes("auth")) {
          response.setHeader('Cache-Control', 'public, max-age=10');

          // const ifNoneMatch = request.headers['if-none-match'];
          // if (ifNoneMatch === `"${etag}"`) {
          //   response.status(304);
          //   return null;
          // }
        }
        else {
            response.setHeader('Cache-Control', 'no-store');
            response.setHeader('Pragma', 'no-cache');
            response.setHeader('Expires', '0');
        }

        return data;
      }),
    );
  }
}