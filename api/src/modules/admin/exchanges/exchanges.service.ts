import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange } from '../../../entities';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { parse } from 'csv-parse/sync';
import { ExchangeProduct } from '../../../entities';
import { ImportExchangeProductDto } from './dto';

export type ExchangeListItem = {
  id: number;
  name: string;
};

@Injectable()
export class AdminExchangesService {
  constructor(
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
    @InjectRepository(ExchangeProduct)
    private exchangeProductRepository: Repository<ExchangeProduct>,
  ) {}

  async getExchangeList(): Promise<ExchangeListItem[]> {
    // Get all active exchanges
    const activeExchanges = await this.exchangeRepository.find({
      where: { is_active: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });

    // Add PerkX as first item with id: null
    const perkXItem: ExchangeListItem = {
      id: null,
      name: 'PerkX',
    };

    return [perkXItem, ...activeExchanges];
  }

  /**
   * Parse CSV file and validate data
   */
  async importExchangeProducts(file: Express.Multer.File): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let successCount = 0;
    let failedCount = 0;

    try {
      // Parse CSV file using csv-parse library
      const records = parse(file.buffer.toString('utf-8'), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: false, // Keep as strings for validation
      }) as Record<string, string>[];

      // Validate and process each row
      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNumber = i + 2;

        try {
          // Transform CSV row to DTO
          const dto = plainToInstance(ImportExchangeProductDto, row);

          // Validate using class-validator
          const validationErrors = await validate(dto);

          if (validationErrors.length > 0) {
            const errorMessages = validationErrors
              .map((err) => {
                const constraints = Object.values(err.constraints || {});
                return constraints.join(', ');
              })
              .join('; ');
            errors.push(`Row ${rowNumber}: ${errorMessages}`);
            failedCount++;
            continue;
          }

          // Handle empty ave_rebate
          if (
            dto.ave_rebate === null ||
            dto.ave_rebate === undefined
          ) {
            dto.ave_rebate = null;
          }

          // Create exchange product entity
          const exchangeProduct = this.exchangeProductRepository.create({
            exchange_name: dto.exchange_name.trim(),
            exchange_signup_link: dto.exchange_signup_link.trim(),
            product_name: dto.product_name.trim(),
            discount: dto.discount,
            default_fee_maker: dto.default_fee_maker,
            default_fee_taker: dto.default_fee_taker,
            final_fee_maker: dto.final_fee_maker,
            final_fee_taker: dto.final_fee_taker,
            ave_rebate: dto.ave_rebate,
          });

          await this.exchangeProductRepository.save(exchangeProduct);
          successCount++;
        } catch (error) {
          errors.push(
            `Row ${rowNumber}: ${error.message || 'Unknown error'}`,
          );
          failedCount++;
        }
      }

      return {
        success: successCount,
        failed: failedCount,
        errors,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse CSV file: ${error.message}`,
      );
    }
  }
}
