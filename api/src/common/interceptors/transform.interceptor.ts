import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  constructor(private configService: ConfigService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const timezone = this.configService.get<string>('timezone.default') || 'Asia/Singapore';

    return next.handle().pipe(
      map((data) => {
        // Transform all created_at and updated_at fields in the data to configured timezone
        const transformedData = transformDatesToTimezone(data, timezone);
        
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: 'Success',
          data: transformedData,
          timestamp: convertToTimezone(new Date(), timezone) || new Date().toISOString(),
        };
      }),
    );
  }
}
