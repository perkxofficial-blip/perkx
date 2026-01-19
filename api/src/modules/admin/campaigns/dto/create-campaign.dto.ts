import {
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignCategory } from '../../../../entities';

export class CreateCampaignDto {
  @ApiPropertyOptional({
    description: 'Exchange ID',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  exchange_id?: number;

  @ApiProperty({
    description: 'Campaign title',
    example: 'Summer Trading Competition',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Campaign description',
    example: 'Join our summer trading competition and win amazing prizes!',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Banner image URL',
    example: 'https://example.com/banner.jpg',
  })
  @IsUrl()
  banner_url: string;

  @ApiPropertyOptional({
    description: 'Redirect URL',
    example: 'https://example.com/campaign',
  })
  @IsOptional()
  @IsUrl()
  redirect_url?: string;

  @ApiPropertyOptional({
    description: 'Is campaign active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Preview start date',
    example: '2025-01-01T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  preview_start?: Date;

  @ApiPropertyOptional({
    description: 'Preview end date',
    example: '2025-01-15T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  preview_end?: Date;

  @ApiPropertyOptional({
    description: 'Launch start date',
    example: '2025-01-16T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  launch_start?: Date;

  @ApiPropertyOptional({
    description: 'Launch end date',
    example: '2025-02-28T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  launch_end?: Date;

  @ApiPropertyOptional({
    description: 'Archive start date',
    example: '2025-03-01T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  archive_start?: Date;

  @ApiPropertyOptional({
    description: 'Archive end date',
    example: '2025-03-31T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  archive_end?: Date;

  @ApiPropertyOptional({
    description: 'Is campaign featured',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Campaign category',
    enum: CampaignCategory,
    example: CampaignCategory.NEW_USER,
  })
  @IsOptional()
  @IsEnum(CampaignCategory)
  category?: CampaignCategory;
}
