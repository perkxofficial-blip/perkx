import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'validate.email_required' })
  email: string;

  @IsNotEmpty({ message: 'validate.password_required' })
  @IsString({ message: 'validate.password_string' })
  password: string;
}
