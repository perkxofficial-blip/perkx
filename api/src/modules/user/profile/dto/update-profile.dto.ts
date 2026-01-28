import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserGender } from '../../../../entities';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+84123456789',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'User gender',
    enum: UserGender,
    example: UserGender.MALE,
  })
  @IsEnum(UserGender)
  @IsOptional()
  gender?: UserGender;

  @ApiPropertyOptional({
    description: 'User birthday',
    example: '1990-01-01',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsOptional()
  birthday?: string;

  @ApiPropertyOptional({
    description: 'User country',
    example: 'Vietnam',
  })
  @IsString()
  @IsOptional()
  country?: string;
}
