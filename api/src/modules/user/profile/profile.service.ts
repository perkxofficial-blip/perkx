import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserExchange, Exchange } from '../../../entities';
import { UpdateProfileDto, UpdatePasswordDto } from './dto';
import { StorageService } from '../../../common/storage/storage.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserExchange)
    private userExchangeRepository: Repository<UserExchange>,
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
    private storageService: StorageService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return only user information, exclude password
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only allow updating: first_name, last_name, phone, gender, birthday, country
    // Do not allow updating: referral_user_id, email, referral_code
    const allowedFields = ['first_name', 'last_name', 'phone', 'gender', 'birthday', 'country'];
    const updateData: Partial<User> = {};
    
    for (const field of allowedFields) {
      if (updateProfileDto[field] !== undefined) {
        updateData[field] = updateProfileDto[field];
      }
    }

    // Convert birthday string to Date if provided
    if (updateProfileDto.birthday) {
      updateData.birthday = new Date(updateProfileDto.birthday);
    }

    Object.assign(user, updateData);
    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.validatePassword(updatePasswordDto.current_password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new password is same as current password
    const isSamePassword = await user.validatePassword(updatePasswordDto.new_password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Update password (will be hashed by BeforeUpdate hook)
    user.password = updatePasswordDto.new_password;
    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async getLinkedExchanges(userId: number) {
    const userExchanges = await this.userExchangeRepository
      .createQueryBuilder('user_exchange')
      .leftJoin(Exchange, 'exchange', 'user_exchange.exchange_id = exchange.id')
      .select([
        'user_exchange.exchange_uid AS exchange_uid',
        'user_exchange.created_at AS linked_at',
        'exchange.id AS exchange_id',
        'exchange.name AS exchange_name',
        'exchange.code AS exchange_code',
        'exchange.logo_path AS exchange_logo_path',
      ])
      .where('user_exchange.user_id = :userId', { userId })
      .orderBy('user_exchange.created_at', 'DESC')
      .getRawMany();

    return userExchanges.map((row) => ({
      id: row.exchange_id,
      name: row.exchange_name,
      code: row.exchange_code,
      logo_path: row.exchange_logo_path,
      logo_url: row.exchange_logo_path
        ? this.storageService.getFileLocal(row.exchange_logo_path)
        : null,
      exchange_uid: row.exchange_uid,
      linked_at: row.linked_at,
    }));
  }
}
