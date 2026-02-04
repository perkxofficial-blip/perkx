import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities';
import { UpdateProfileDto, UpdatePasswordDto } from './dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getProfile(userId: number) {
    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .leftJoin(User, 'referrer', 'user.referral_user_id = referrer.id')
      .select([
        'user.id',
        'user.email',
        'user.first_name',
        'user.last_name',
        'user.phone',
        'user.birthday',
        'user.gender',
        'user.country',
        'user.status',
        'user.referral_code',
        'referrer.referral_code',
      ])
      .where('user.id = :userId', { userId });

    const userResult = await userQuery.getRawOne();

    if (!userResult) {
      throw new NotFoundException('User not found');
    }

    // Format result
    const result: any = {
      id: userResult.user_id,
      email: userResult.user_email,
      first_name: userResult.user_first_name,
      last_name: userResult.user_last_name,
      phone: userResult.user_phone,
      birthday: userResult.user_birthday,
      gender: userResult.user_gender,
      country: userResult.user_country,
      status: userResult.user_status,
      referral_code: userResult.user_referral_code,
    };

    // Add referrer referral_code if exists
    if (userResult.referrer_referral_code) {
      result.referrer_referral_code = userResult.referrer_referral_code;
    }

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

}
