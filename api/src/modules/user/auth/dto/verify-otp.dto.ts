import { IsEmail, IsNotEmpty, Length, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @IsNotEmpty({ message: 'OTP should not be empty' })
  @Length(6, 6)
  otp: string;
}
