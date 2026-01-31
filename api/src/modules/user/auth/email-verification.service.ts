import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User, UserEmailVerification, UserStatus } from '../../../entities';
import { MailService } from '../../../mail/mail.service';

@Injectable()
export class EmailVerificationService {
  private generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  constructor(
    @InjectRepository(UserEmailVerification)
    private repo: Repository<UserEmailVerification>,
    private mailerService: MailService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async sendWithManager(
    manager: EntityManager,
    user: { id: number; email: string },
  ) {
    return await this.createTokenAndDispatch(
      manager.getRepository(UserEmailVerification),
      user,
    );
  }

  async getVerify(token: string) {
    const verify = await this.repo.findOne({
      where: {
        token: token,
        verified_at: IsNull(),
      },
    });
    console.log(verify);
    return {
      status: !!verify,
      expired_at: verify?.created_at,
    };
  }

  async reSend(user: { id: number; email: string }) {
    return await this.createTokenAndDispatch(this.repo, user);
  }

  private async createTokenAndDispatch(
    repo: Repository<UserEmailVerification>,
    user: { id: number; email: string },
  ) {
    await repo.delete({ user_id: user.id });
    const token = this.generateToken();
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);

    await repo.save({
      user_id: user.id,
      token: token,
      expires_at: expires,
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    await this.mailerService.sendMailRegister(user.email, verifyUrl)
    return token;
  }
  async verify(token: string) {
    return this.dataSource.transaction(async (manager) => {
      const verifyRepo = manager.getRepository(UserEmailVerification);
      const userRepo = manager.getRepository(User);

      const record = await verifyRepo.findOne({
        where: { token: token },
      });

      if (!record) throw new NotFoundException('Invalid token');
      if (record.verified_at)
        throw new BadRequestException('Email already verified');
      if (record.expires_at < new Date())
        throw new BadRequestException('Token expired');

      const now = new Date();
      record.verified_at = now;
      await verifyRepo.save(record);
      const user = await userRepo.findOneBy({ id: record.user_id });
      user.status = UserStatus.ACTIVE;
      user.email_verified_at = now;
      await userRepo.save(user);

      await this.mailerService.sendMailActive(user.email)

      return user;
    });
  }

  async getOldToken(userId: number) {
    const record = await this.repo.findOne({
      where: { user_id: userId },
    });
    return record.token;
  }
}
