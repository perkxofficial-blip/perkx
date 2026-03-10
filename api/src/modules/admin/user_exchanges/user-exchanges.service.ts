import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserExchange } from '../../../entities';
import { ListUserExchangesQueryDto, UpdateUserExchangeDto } from './dto';

@Injectable()
export class UserExchangesService {
  constructor(
    @InjectRepository(UserExchange)
    private userExchangeRepository: Repository<UserExchange>,
  ) {}

  /**
   * Get list of user exchanges with filters and pagination
   */
  async getUserExchanges(query: ListUserExchangesQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userExchangeRepository
      .createQueryBuilder('user_exchange')
      .leftJoinAndSelect('user_exchange.user', 'user')
      .leftJoinAndSelect('user_exchange.exchange', 'exchange');

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
    // Note: With ManyToOne (1-1) relations, count remains accurate even with joins
    const total = await queryBuilder.getCount();

    // Get total pending count (with same filters except status)
    const pendingCountQueryBuilder = this.userExchangeRepository
      .createQueryBuilder('user_exchange')
      .where('user_exchange.status = :pendingStatus', { pendingStatus: 'PENDING' });

    const totalPending = await pendingCountQueryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const results = await queryBuilder.getMany();

    const data = results.map((row) => ({
      id: row.id,
      user_id: row.user?.id,
      user_email: row.user?.email,
      exchange_id: row.exchange?.id,
      exchange_name: row.exchange?.name,
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
        totalPending,
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
