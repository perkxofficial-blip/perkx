import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchPassword } from '../../../../common/validators/match-password.validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentPass123',
  })
  @IsString()
  @IsNotEmpty()
  current_password: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters, 1 number, 1 uppercase letter)',
    example: 'NewPass123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Password needs to be a minimum of 8 characters, 1 number, and 1 uppercase letter',
  })
  new_password: string;

  @ApiProperty({
    description: 'Confirm new password (must match new password)',
    example: 'NewPass123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MatchPassword('new_password', {
    message: 'Confirm password does not match',
  })
  confirm_new_password: string;
}
