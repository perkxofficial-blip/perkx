import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Custom transformer to handle comma as decimal separator and convert to number
 */
function CommaToDotDecimal() {
  return Transform(({ value }) => parseFloat(value))
}

export class ImportExchangeProductDto {
  @ApiProperty({
    description: 'Exchange name',
    example: 'Binance',
  })
  @IsNotEmpty({ message: 'exchange_name is required' })
  @IsString()
  exchange_name: string;

  @ApiProperty({
    description: 'Exchange signup link',
    example: 'https://binance.com/signup',
  })
  @IsNotEmpty({ message: 'exchange_signup_link is required' })
  @IsUrl({}, { message: 'exchange_signup_link must be a valid URL' })
  exchange_signup_link: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Spot Trading',
  })
  @IsNotEmpty({ message: 'product_name is required' })
  @IsString()
  product_name: string;

  @ApiProperty({
    description: 'Discount percentage',
    example: 20,
  })
  @IsNotEmpty({ message: 'discount is required' })
  @CommaToDotDecimal()
  @Type(() => Number)
  @IsNumber({}, { message: 'discount must be a valid decimal number' })
  discount: number;

  @ApiProperty({
    description: 'Default fee maker',
    example: 0.1,
  })
  @IsNotEmpty({ message: 'default_fee_maker is required' })
  @CommaToDotDecimal()
  @Type(() => Number)
  @IsNumber({}, { message: 'default_fee_maker must be a valid decimal number' })
  default_fee_maker: number;

  @ApiProperty({
    description: 'Default fee taker',
    example: 0.1,
  })
  @IsNotEmpty({ message: 'default_fee_taker is required' })
  @CommaToDotDecimal()
  @Type(() => Number)
  @IsNumber({}, { message: 'default_fee_taker must be a valid decimal number' })
  default_fee_taker: number;

  @ApiProperty({
    description: 'Final fee maker',
    example: 0.08,
  })
  @IsNotEmpty({ message: 'final_fee_maker is required' })
  @CommaToDotDecimal()
  @Type(() => Number)
  @IsNumber({}, { message: 'final_fee_maker must be a valid decimal number' })
  final_fee_maker: number;

  @ApiProperty({
    description: 'Final fee taker',
    example: 0.08,
  })
  @IsNotEmpty({ message: 'final_fee_taker is required' })
  @CommaToDotDecimal()
  @Type(() => Number)
  @IsNumber({}, { message: 'final_fee_taker must be a valid decimal number' })
  final_fee_taker: number;

  @ApiPropertyOptional({
    description: 'Average rebate',
    example: 1200,
  })
  @IsOptional()
  @CommaToDotDecimal()
  @Type(() => Number)
  @ValidateIf((o) => o.ave_rebate !== null && o.ave_rebate !== undefined)
  @IsNumber({}, { message: 'ave_rebate must be a valid decimal number' })
  ave_rebate?: number | null;
}
