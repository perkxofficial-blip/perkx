import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { lastValueFrom, Observable } from 'rxjs';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const dto = plainToInstance(LoginDto, request.body);
    const errors = await validate(dto, { stopAtFirstError: true });

    if (errors.length) {
      throw new BadRequestException(
        errors.map(err => ({
          field: err.property,
          message: Object.values(err.constraints!)[0],
        })),
      );
    }

    const result = super.canActivate(context);

    if (result instanceof Observable) {
      return lastValueFrom(result);
    }
    console.log(result, 'result')
    return result;
  }
}
