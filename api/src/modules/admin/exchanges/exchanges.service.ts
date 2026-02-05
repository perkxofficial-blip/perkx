import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange, UserExchange, User } from '../../../entities';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { parse } from 'csv-parse/sync';
import { ExchangeProduct } from '../../../entities';
import { ImportExchangeProductDto, ListUserExchangesQueryDto, UpdateUserExchangeDto } from './dto';

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
    @InjectRepository(UserExchange)
    private userExchangeRepository: Repository<UserExchange>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getExchangeList(): Promise<ExchangeListItem[]> {
    // Get all active exchanges
    const activeExchanges = await this.exchangeRepository.find({
      where: { is_active: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });

    // Add PerkX as first item with id: 0
    const perkXItem: ExchangeListItem = {
      id: 0,
      name: 'PerkX',
    };

    return [perkXItem, ...activeExchanges];
  }

  /**
   * Parse CSV file and validate data
   * All-or-nothing: only insert if all rows are valid
   */
  async importExchangeProducts(file: Express.Multer.File): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    const validDtos: ImportExchangeProductDto[] = [];

    try {
      // Parse CSV file using csv-parse library
      const records = parse(file.buffer.toString('utf-8'), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: false, // Keep as strings for validation
      }) as Record<string, string>[];

      // Step 1: Validate all rows first (all-or-nothing approach)
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
          } else {
            // Handle empty ave_rebate
            if (
              dto.ave_rebate === null ||
              dto.ave_rebate === undefined
            ) {
              dto.ave_rebate = null;
            }
            validDtos.push(dto);
          }
        } catch (error) {
          errors.push(
            `Row ${rowNumber}: ${error.message || 'Unknown error'}`,
          );
        }
      }

      // Step 2: If any validation errors, return without inserting anything
      if (errors.length > 0) {
        throw new BadRequestException({
          success: 0,
          failed: records.length,
          errors,
        });
      }

      // Step 3: All rows are valid - truncate table and insert all
      return await this.exchangeProductRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.query(
            'TRUNCATE TABLE exchange_products RESTART IDENTITY CASCADE',
          );

          const exchangeProducts = validDtos.map((dto) =>
            this.exchangeProductRepository.create({
              exchange_name: dto.exchange_name.trim(),
              exchange_signup_link: dto.exchange_signup_link.trim(),
              product_name: dto.product_name.trim(),
              discount: dto.discount,
              default_fee_maker: dto.default_fee_maker,
              default_fee_taker: dto.default_fee_taker,
              final_fee_maker: dto.final_fee_maker,
              final_fee_taker: dto.final_fee_taker,
              ave_rebate: dto.ave_rebate,
            }),
          );

          // Insert all at once
          await transactionalEntityManager.save(
            ExchangeProduct,
            exchangeProducts,
          );

          return {
            success: validDtos.length,
            failed: 0,
            errors: [],
          };
        },
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to parse CSV file: ${error.message}`,
      );
    }
  }

  /**
   * Get list of user exchanges with filters and pagination
   */
  async getUserExchanges(query: ListUserExchangesQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userExchangeRepository
      .createQueryBuilder('user_exchange')
      .innerJoin('users', 'user', 'user_exchange.user_id = user.id')
      .innerJoin('exchanges', 'exchange', 'user_exchange.exchange_id = exchange.id')
      .select([
        'user_exchange.id AS id',
        'user.email AS user_email',
        'exchange.name AS exchange_name',
        'user_exchange.exchange_uid AS exchange_uid',
        'user_exchange.created_at AS created_at',
        'user_exchange.status AS status',
        'user_exchange.updated_at AS updated_at',
        'user_exchange.reason AS reason',
        'user_exchange.updated_by AS updated_by',
      ]);

    // Apply filters
    if (query.exchange_id) {
      queryBuilder.andWhere('user_exchange.exchange_id = :exchangeId', {
        exchangeId: query.exchange_id,
      });
    }

    if (query.status) {
      queryBuilder.andWhere('user_exchange.status = :status', {
        status: query.status,
      });
    }

    queryBuilder.orderBy('user_exchange.created_at', 'DESC');

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const results = await queryBuilder.getRawMany();

    const data = results.map((row) => ({
      id: row.id,
      user_email: row.user_email,
      exchange_name: row.exchange_name,
      exchange_uid: row.exchange_uid,
      created_at: row.created_at,
      status: row.status,
      updated_at: row.updated_at,
      reason: row.reason,
      updated_by: row.updated_by,
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user exchange status and reason
   */
  async updateUserExchange(
    id: number,
    updateDto: UpdateUserExchangeDto,
    adminUsername: string,
  ) {
    const userExchange = await this.userExchangeRepository.findOne({
      where: { id },
    });

    if (!userExchange) {
      throw new NotFoundException(`User exchange with ID ${id} not found`);
    }

    userExchange.status = updateDto.status;
    userExchange.updated_by = adminUsername;
    userExchange.reason = updateDto.reason || null;

    const updated = await this.userExchangeRepository.save(userExchange);

    return {
      id: updated.id,
      status: updated.status,
      reason: updated.reason,
      updated_by: updated.updated_by,
      updated_at: updated.updated_at,
    };
  }
}
