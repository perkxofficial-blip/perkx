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
    example: 'abc123xyz',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Exchange UID is required' })
  @MaxLength(100, { message: 'Exchange UID must not exceed 100 characters' })
  exchange_uid: string;
}
