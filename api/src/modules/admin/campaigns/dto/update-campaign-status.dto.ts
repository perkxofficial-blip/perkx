import { IsOptional, IsBoolean, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransformBoolean } from '../../../../common/decorators/transform-boolean.decorator';

export class UpdateCampaignStatusDto {
  @ApiPropertyOptional({
    description: 'Update featured status',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @TransformBoolean()
  @IsBoolean({ message: 'Featured must be a boolean value' })
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Update active status',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @TransformBoolean()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  is_active?: boolean;
}
