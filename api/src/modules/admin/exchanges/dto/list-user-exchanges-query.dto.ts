import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum UserExchangeStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

export class ListUserExchangesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by exchange ID',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  exchange_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: UserExchangeStatus,
    example: UserExchangeStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserExchangeStatus, {
    message: 'Status must be one of: ACTIVE, PENDING, REJECTED',
  })
  status?: UserExchangeStatus;

  @ApiPropertyOptional({
    description: 'Page number (default: 1)',
    example: 1,
    type: Number,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page (default: 50)',
    example: 50,
    type: Number,
    minimum: 1,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}
