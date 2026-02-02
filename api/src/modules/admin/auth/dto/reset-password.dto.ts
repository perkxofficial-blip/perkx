import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token received via email',
    example: 'abcd1234567890efgh',
    minLength: 1
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password for admin account',
    example: 'MyNewSecurePassword123',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}