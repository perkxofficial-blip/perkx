import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../../../../common/validators';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @ApiProperty({
    description: 'User password (6–32 characters)',
    example: 'password123',
    minLength: 6,
    maxLength: 16,
  })
  @IsString({ message: 'validate.password_string' })
  @IsNotEmpty({ message: 'validate.password_required' })
  @MinLength(8, { message: 'validate.password_min_8' })
  @MaxLength(16, { message: 'validate.password_max_16' })
  @Matches(
    /^(?=.*[A-Z])(?=.*\d).{8,}$/,
    {
      message:
        'validate.password_invalid_format',
    },
  )
  password: string;


  @ApiProperty({
    description: 'Confirm password',
    example: 'password123',
  })
  @IsString({ message: 'validate.confirm_password_string' })
  @IsNotEmpty({ message: 'validate.confirm_password_required' })
  @Match('password', { message: 'validate.password_not_match' })
  confirm_password: string;
}
