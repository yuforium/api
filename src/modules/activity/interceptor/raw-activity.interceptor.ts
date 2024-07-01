import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class RawActivityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    let rawActivity = '';

    request.on('data', (chunk: string) => {
      rawActivity += chunk;
    });

    request.on('end', () => {
      request.rawActivity = rawActivity;
    });

    return next.handle().pipe(
      map(data => {
        return data;
      })
    );
  }
}

declare module 'express' {
  export interface Request {
    rawActivity: string;
  }
}
