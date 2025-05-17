import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as xml2js from 'xml2js';

@Injectable()
export class XmlResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const acceptHeader = request.headers['accept'] || '';
    
    const handler = context.getHandler();
    
    const isRenderRoute = Reflect.getMetadata('__renderTemplate__', handler) !== undefined;
    
    const wantsXml = !isRenderRoute && 
                    acceptHeader.includes('application/xml') && 
                    !acceptHeader.includes('application/json;q=1.0');

    return next.handle().pipe(
      map(data => {
        if (wantsXml) {
          if (data && typeof data === 'object' && !(data instanceof Buffer)) {
            response.header('Content-Type', 'application/xml');
            
            const builder = new xml2js.Builder({
              rootName: 'response',
              renderOpts: { pretty: true, indent: '  ', newline: '\n' },
              headless: true,
            });
            
            return builder.buildObject(data);
          }
        }
        return data;
      }),
    );
  }
}
