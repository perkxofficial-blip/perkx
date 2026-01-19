import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendDto {
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;
}
