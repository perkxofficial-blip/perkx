import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find({
      select: [
        'id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'is_active',
        'created_at',
        'updated_at',
      ],
      order: { created_at: 'DESC' },
    });
    return users;
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
        'is_active',
        'created_at',
        'updated_at',
      ],
    });
    return user;
  }
}
