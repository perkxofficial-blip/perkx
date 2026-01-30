import { IsOptional, IsBoolean, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransformBoolean } from '../../../../common/decorators/transform-boolean.decorator';
import { CampaignCategory } from '../../../../entities';

export enum CampaignStatus {
  ACTIVE = 'active',
  UPCOMING = 'upcoming',
  EXPIRED = 'expired',
}

export class PublicListCampaignsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by featured campaigns only',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @TransformBoolean()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by campaign status',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CampaignStatus, {
    message: 'Status must be one of: active, upcoming, expired',
  })
  status?: CampaignStatus;

  @ApiPropertyOptional({
    description: 'Filter by campaign category',
    enum: CampaignCategory,
    example: CampaignCategory.NEW_USER,
  })
  @IsOptional()
  @IsEnum(CampaignCategory, {
    message: 'Category must be one of: new_user, trading_competition',
  })
  category?: CampaignCategory;

  @ApiPropertyOptional({
    description: 'Filter by exchange code (e.g., "binance", "bybit") or "perkx" for PerkX campaigns (exchange_id = 0)',
    example: 'binance',
    type: String,
  })
  @IsOptional()
  @IsString()
  exchange?: string;

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
    description: 'Number of items per page (default: 15)',
    example: 15,
    type: Number,
    minimum: 1,
    default: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 15;
}
