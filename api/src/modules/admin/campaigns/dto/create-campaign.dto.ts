import {
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  MaxLength,
  ValidateIf,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignCategory } from '../../../../entities';
import { TransformBoolean } from '../../../../common/decorators/transform-boolean.decorator';
import { TransformDateUTC8 } from '../../../../common/decorators/transform-date-utc8.decorator';
import { CampaignPeriodOrderConstraint } from '../../../../common/validators/campaign-period.validator';

export class CreateCampaignDto {
  @ApiPropertyOptional({
    description: 'Exchange ID',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
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
    description: 'Campaign sub title',
    example: 'Win amazing prizes',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  sub_title: string;

  @ApiProperty({
    description: 'Campaign description',
    example: 'Join our summer trading competition and win amazing prizes!',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Redirect URL',
    example: 'https://example.com/campaign',
  })
  @IsOptional()
  @ValidateIf((object, value) => value !== '' && value != null)
  @IsUrl({}, { message: 'redirect_url must be a valid URL' })
  redirect_url?: string;

  @ApiPropertyOptional({
    description: 'Is campaign active',
    default: true,
  })
  @IsOptional()
  @TransformBoolean()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Preview start date',
    example: '2025-01-01T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @TransformDateUTC8()
  @IsDate()
  preview_start?: Date;

  @ApiPropertyOptional({
    description: 'Preview end date',
    example: '2025-01-15T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @TransformDateUTC8()
  @IsDate()
  preview_end?: Date;

  @ApiPropertyOptional({
    description: 'Launch start date',
    example: '2025-01-16T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @TransformDateUTC8()
  @IsDate()
  launch_start?: Date;

  @ApiPropertyOptional({
    description: 'Launch end date',
    example: '2025-02-28T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @TransformDateUTC8()
  @IsDate()
  launch_end?: Date;

  @ApiPropertyOptional({
    description: 'Archive start date',
    example: '2025-03-01T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @TransformDateUTC8()
  @IsDate()
  archive_start?: Date;

  @ApiPropertyOptional({
    description: 'Archive end date',
    example: '2025-03-31T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  @TransformDateUTC8()
  @IsDate()
  @Validate(CampaignPeriodOrderConstraint)
  archive_end?: Date;

  @ApiPropertyOptional({
    description: 'Is campaign featured',
    default: false,
  })
  @IsOptional()
  @TransformBoolean()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Campaign category',
    enum: CampaignCategory,
    example: CampaignCategory.ALL_USER,
  })
  @IsOptional()
  @IsEnum(CampaignCategory)
  category?: CampaignCategory;
}
