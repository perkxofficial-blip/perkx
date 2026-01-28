import { IsEmail, IsNotEmpty, Length, MinLength } from 'class-validator';

export class ResendOtpDto {
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;
}
