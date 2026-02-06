import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserExchangeStatus } from './list-user-exchanges-query.dto';

export class UpdateUserExchangeDto {
  @ApiProperty({
    description: 'Status to update',
    enum: UserExchangeStatus,
    example: UserExchangeStatus.ACTIVE,
  })
  @IsEnum(UserExchangeStatus, {
    message: 'Status must be one of: ACTIVE, PENDING, REJECTED',
  })
  status: UserExchangeStatus;

  @ApiPropertyOptional({
    description: 'Reason for the status (optional)',
    example: 'Verification failed',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
