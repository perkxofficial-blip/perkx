import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransformBoolean } from '../../../../common/decorators/transform-boolean.decorator';

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
}
