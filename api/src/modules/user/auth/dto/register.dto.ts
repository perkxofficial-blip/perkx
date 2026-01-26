import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString, Matches, MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../../../../common/validators';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'validate.email_invalid' })
  @IsNotEmpty({ message: 'validate.email_required' })
  email: string;

  @ApiProperty({
    description: 'User password (6–32 characters)',
    example: 'password123',
    minLength: 6,
    maxLength: 16,
  })
  @IsString({ message: 'validate.password_string' })
  @IsNotEmpty({ message: 'validate.password_required' })
  @MinLength(6, { message: 'validate.password_min_6' })
  @MaxLength(16, { message: 'validate.password_max_16' })
  @Matches(/^[a-zA-Z0-9!@#$%^&*()=+-]+$/, {
    message: 'validate.password_invalid_format',
  })
  password: string;


  @ApiProperty({
    description: 'Confirm password',
    example: 'password123',
  })
  @IsString({ message: 'validate.confirm_password_string' })
  @IsNotEmpty({ message: 'validate.confirm_password_required' })
  @Match('password', { message: 'validate.password_not_match' })
  confirm_password: string;

  @ApiProperty({
    description: 'Referral invite code',
    example: 'xxxx-xxxxxx',
    required: false,
  })
  @IsString({ message: 'validate.referral_string' })
  @IsOptional()
  referral_user_id?: string;
}
