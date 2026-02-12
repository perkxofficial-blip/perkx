import { IsString, IsNotEmpty, MaxLength, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddExchangeUidDto {
  @ApiProperty({
    description: 'Exchange ID',
    example: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: 'Exchange ID must be an integer' })
  @IsNotEmpty({ message: 'Exchange ID is required' })
  exchange_id: number;

  @ApiProperty({
    description: 'Exchange UID from the exchange platform',
    example: 'abc123xyz7890123456',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty({ message: 'Exchange UID is required' })
  @MaxLength(20, { message: 'Exchange UID must not exceed 20 characters' })
  exchange_uid: string;
}
