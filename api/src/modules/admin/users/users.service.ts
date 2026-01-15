import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'status',
        'created_at',
        'updated_at',
      ],
    });
    return user;
  }
}
