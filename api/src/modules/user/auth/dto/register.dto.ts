import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters, 1 number, 1 uppercase letter)',
    example: 'Password123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Password needs to be a minimum of 8 characters, 1 number, and 1 uppercase letter',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Referral invite code',
    example: 'xxxx-xxxxxx',
  })
  @IsString()
  @IsOptional()
  referral_code?: string;
}
