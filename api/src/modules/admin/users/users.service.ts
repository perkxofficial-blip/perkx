import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserExchange, Exchange, UserStatus } from '../../../entities';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserExchange)
    private userExchangeRepository: Repository<UserExchange>,
  ) { }

  async findAll(queryDto: ListUsersQueryDto) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin(User, 'referral_user', 'user.referral_user_id = referral_user.id')
      .select([
        'user.id AS id',
        'user.email AS email',
        'user.referral_code AS referral_code',
        'user.birthday AS birthday',
        'user.gender AS gender',
        'user.country AS country',
        'user.created_at AS created_at',
        'user.status AS status',
        'user.email_verified_at AS email_verified_at',
        'referral_user.id AS referral_user_id',
        'referral_user.email AS referral_user_email',
        'referral_user.referral_code AS referral_user_referral_code',
      ])
      .orderBy('user.created_at', 'DESC');

    // Filter by search (email, referral_code, or referral_code of referral_user)
    if (queryDto.search) {
      queryBuilder.andWhere(
        '(user.email LIKE :searchLike OR user.referral_code = :search OR referral_user.referral_code = :search)',
        { searchLike: `%${queryDto.search}%`, search: queryDto.search },
      );
    }

    // Filter by date range
    if (queryDto.start_date) {
      queryBuilder.andWhere('user.created_at >= :start_date', {
        start_date: queryDto.start_date,
      });
    }

    if (queryDto.end_date) {
      queryBuilder.andWhere('user.created_at <= :end_date', {
        end_date: queryDto.end_date,
      });
    }

    // Filter by status
    if (queryDto.status !== undefined) {
      queryBuilder.andWhere('user.status = :status', {
        status: queryDto.status,
      });
    }

    const countQueryBuilder = queryBuilder.clone().orderBy();
    const total = await countQueryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const results = await queryBuilder.getRawMany();

    // Transform data to match required response format
    const data = results.map((row) => ({
      id: row.id,
      email: row.email,
      referral_code: row.referral_code,
      birthday: row.birthday,
      gender: row.gender,
      country: row.country,
      created_at: row.created_at,
      referral_by: row.referral_user_id
        ? {
          id: row.referral_user_id,
          email: row.referral_user_email,
          referral_code: row.referral_user_referral_code,
        }
        : null,
      status: row.status,
      email_verified_at: row.email_verified_at,
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

  async findOne(id: number) {
    // Get user basic info with referrer info
    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .leftJoin(User, 'referrer', 'user.referral_user_id = referrer.id')
      .select([
        'user.id',
        'user.email',
        'user.first_name',
        'user.last_name',
        'user.phone',
        'user.status',
        'user.referral_code',
        'user.birthday',
        'user.gender',
        'user.country',
        'user.email_verified_at',
        'user.created_at',
        'user.updated_at',
        'referrer.id',
        'referrer.first_name',
        'referrer.last_name',
        'referrer.email',
      ])
      .where('user.id = :id', { id });

    const userResult = await userQuery.getRawOne();

    if (!userResult) {
      return null;
    }

    // Get list of users referred by this user
    const referralsQuery = this.userRepository
      .createQueryBuilder('referred_user')
      .select([
        'referred_user.id',
        'referred_user.email',
        'referred_user.created_at',
      ])
      .where('referred_user.referral_user_id = :id', { id })
      .orderBy('referred_user.created_at', 'DESC');

    const referrals = await referralsQuery.getRawMany();

    // Get list of exchanges linked to this user
    const exchangesQuery = this.userExchangeRepository
      .createQueryBuilder('user_exchange')
      .leftJoin(Exchange, 'exchange', 'user_exchange.exchange_id = exchange.id')
      .select([
        'exchange.name AS exchange_name',
        'user_exchange.exchange_uid AS exchange_uid',
      ])
      .where('user_exchange.user_id = :id', { id });

    const exchanges = await exchangesQuery.getRawMany();

    // Format referrer name
    const referrerName = userResult.referrer_first_name || userResult.referrer_last_name
      ? `${userResult.referrer_first_name || ''} ${userResult.referrer_last_name || ''}`.trim()
      : null;

    return {
      id: userResult.user_id,
      email: userResult.user_email,
      first_name: userResult.user_first_name,
      last_name: userResult.user_last_name,
      phone: userResult.user_phone,
      status: userResult.user_status,
      referral_code: userResult.user_referral_code,
      birthday: userResult.user_birthday,
      gender: userResult.user_gender,
      country: userResult.user_country,
      email_verified_at: userResult.user_email_verified_at,
      created_at: userResult.user_created_at,
      updated_at: userResult.user_updated_at,
      referrer: userResult.referrer_id
        ? {
            id: userResult.referrer_id,
            name: referrerName,
            email: userResult.referrer_email,
          }
        : null,
      referrals: referrals.map((ref) => ({
        id: ref.referred_user_id,
        email: ref.referred_user_email,
        created_at: ref.referred_user_created_at,
      })),
      exchanges: exchanges.map((ex) => ({
        name: ex.exchange_name,
        uid: ex.exchange_uid,
      })),
    };
  }

  async updateStatus(id: number, status: UserStatus.ACTIVE | UserStatus.DEACTIVATE) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      return null;
    }

    user.status = status;
    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      status: user.status,
    };
  }
}
