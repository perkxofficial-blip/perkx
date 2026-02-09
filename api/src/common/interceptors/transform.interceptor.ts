import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { transformDatesToTimezone, convertToTimezone } from '../utils/date.util';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Transform all created_at and updated_at fields in the data to configured timezone
        // convertToTimezone will automatically get timezone from env (TZ or TIMEZONE) or use default
        const transformedData = transformDatesToTimezone(data);
        
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: 'Success',
          data: transformedData,
          timestamp: convertToTimezone(new Date()) || new Date().toISOString(),
        };
      }),
    );
  }
}
