import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserExchange, Exchange } from '../../../entities';
import { ExchangeAdapterFactory } from '../../../common/exchanges';
import { StorageService } from '../../../common/storage/storage.service';
import { AddExchangeUidDto } from './dto';

@Injectable()
export class ExchangesService {
  constructor(
    @InjectRepository(UserExchange)
    private userExchangeRepository: Repository<UserExchange>,
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
    private exchangeAdapterFactory: ExchangeAdapterFactory,
    private storageService: StorageService,
  ) {}

  /**
   * Add UID exchange for a user
   * Verifies the UID with the exchange API before saving
   */
  async addExchangeUid(
    userId: number,
    addExchangeUidDto: AddExchangeUidDto,
  ) {
    const exchange = await this.exchangeRepository.findOne({
      where: { id: addExchangeUidDto.exchange_id, is_active: true },
    });

    if (!exchange) {
      throw new NotFoundException(
        `Exchange with ID ${addExchangeUidDto.exchange_id} not found or is not active`,
      );
    }

    const existingUserExchange = await this.userExchangeRepository.findOne({
      where: {
        user_id: userId,
        exchange_id: addExchangeUidDto.exchange_id,
      },
    });

    if (existingUserExchange && existingUserExchange.status !== 'REJECTED') {
      throw new ConflictException(
        `Exchange '${exchange.name}' is already linked to your account`,
      );
    }

    const existingUid = await this.userExchangeRepository.findOne({
      where: {
        exchange_id: addExchangeUidDto.exchange_id,
        exchange_uid: addExchangeUidDto.exchange_uid,
        user_id: Not(userId),
      },
    });

    if (existingUid) {
      throw new ConflictException(
        'This UID is already linked to another account',
      );
    }

    // Verify UID with exchange API
    try {
      let status: 'ACTIVE' | 'PENDING' | 'REJECTED';
      let message: string | undefined;

      if (!this.exchangeAdapterFactory.isSupported(exchange.code)) {
        status = 'REJECTED';
        message = `Exchange '${exchange.code}' is not supported for verification`;
      } else {
        const adapter = this.exchangeAdapterFactory.getAdapter(exchange.code);
        const verificationResult = await adapter.verifyAffiliateUid(
          addExchangeUidDto.exchange_uid,
        );
        status = verificationResult.status;
        message = verificationResult.message;
      }

      let savedUserExchange: UserExchange;

      if (existingUserExchange && existingUserExchange.status === 'REJECTED') {
        // Update existing REJECTED record
        existingUserExchange.exchange_uid = addExchangeUidDto.exchange_uid;
        existingUserExchange.status = status;
        existingUserExchange.reason = status === 'REJECTED' ? message : null;
        savedUserExchange = await this.userExchangeRepository.save(
          existingUserExchange,
        );
      } else {
        // Create new record
        const userExchange = this.userExchangeRepository.create({
          user_id: userId,
          exchange_id: addExchangeUidDto.exchange_id,
          exchange_uid: addExchangeUidDto.exchange_uid,
          status,
          updated_by: 'System',
          reason: status === 'REJECTED' ? message : null,
        });
        savedUserExchange = await this.userExchangeRepository.save(
          userExchange,
        );
      }

      return {
        id: savedUserExchange.id,
        exchange_id: savedUserExchange.exchange_id,
        exchange_uid: savedUserExchange.exchange_uid,
        exchange_name: exchange.name,
        exchange_code: exchange.code,
        status: savedUserExchange.status,
        created_at: savedUserExchange.created_at,
        message: message || 'Exchange UID added successfully',
      };
    } catch (error: any) {
      // If it's already a NestJS exception, re-throw it
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log and throw generic error for other cases
      throw new BadRequestException(
        error.message || 'Failed to verify UID with exchange',
      );
    }
  }

  /**
   * Delete UID exchange for a user
   */
  async deleteExchangeUid(userId: number, userExchangeId: number) {
    const userExchange = await this.userExchangeRepository.findOne({
      where: {
        id: userExchangeId,
        user_id: userId,
      },
    });

    if (!userExchange) {
      throw new NotFoundException(
        'Exchange UID not found or does not belong to you',
      );
    }

    // Get exchange name before deleting
    const exchange = await this.exchangeRepository.findOne({
      where: { id: userExchange.exchange_id },
    });

    await this.userExchangeRepository.remove(userExchange);

    return {
      message: 'Exchange UID deleted successfully',
      exchange_name: exchange?.name || 'Unknown',
    };
  }

  /**
   * Get all exchange UIDs linked to a user
   */
  async getUserExchanges(userId: number) {
    const userExchanges = await this.userExchangeRepository
      .createQueryBuilder('user_exchange')
      .leftJoin('exchanges', 'exchange', 'user_exchange.exchange_id = exchange.id')
      .select([
        'user_exchange.id AS id',
        'user_exchange.exchange_id AS exchange_id',
        'user_exchange.exchange_uid AS exchange_uid',
        'user_exchange.status AS status',
        'user_exchange.created_at AS created_at',
        'user_exchange.updated_at AS updated_at',
        'exchange.name AS exchange_name',
        'exchange.code AS exchange_code',
        'exchange.logo_path AS exchange_logo_path',
      ])
      .where('user_exchange.user_id = :userId', { userId })
      .orderBy('user_exchange.created_at', 'DESC')
      .getRawMany();

    return userExchanges.map((row) => ({
      id: row.id,
      exchange_id: row.exchange_id,
      exchange_uid: row.exchange_uid,
      status: row.status,
      exchange_name: row.exchange_name,
      exchange_code: row.exchange_code,
      logo_path: row.exchange_logo_path,
      logo_url: row.exchange_logo_path
        ? this.storageService.getFileUrl(row.exchange_logo_path)
        : null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }
}
