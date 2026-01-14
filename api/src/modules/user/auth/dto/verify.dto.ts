import { IsNotEmpty } from 'class-validator';

export class VerifyDto {
  @IsNotEmpty({ message: 'Token should not be empty' })
  token: string;
}
