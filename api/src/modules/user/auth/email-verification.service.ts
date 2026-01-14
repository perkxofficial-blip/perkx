import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, DataSource } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';
import { UserEmailVerification } from '../../../entities';
import { User } from '../../../entities';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(UserEmailVerification)
    @InjectDataSource()
    private repo: Repository<UserEmailVerification>,
    private mailerService: MailerService,
    private dataSource: DataSource,
  ) {}

  private generateToken() {
    const raw = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    return { raw, hashed };
  }

  async sendWithManager(
    manager: EntityManager,
    user: { id: number; email: string },
  ) {
    await this.createTokenAndDispatch(manager.getRepository(UserEmailVerification), user);
  }

  async reSend(user: { id: number; email: string }) {
    await this.createTokenAndDispatch(this.repo, user);
  }

  private async createTokenAndDispatch(
    repo: Repository<UserEmailVerification>,
    user: { id: number; email: string },
  ) {
    await repo.delete({ user_id: user.id });
    const { raw, hashed } = this.generateToken();
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);

    await repo.save({
      user_id: user.id,
      token: hashed,
      expires_at: expires,
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${raw}`;
    console.log(verifyUrl)
    // await this.mailerService.sendMail({
    //   to: user.email,
    //   subject: 'PerkX - Verify your email',
    //   template: 'verify-email',
    //   context: {
    //     verifyUrl,
    //   },
    // });
  }
  async verify(rawToken: string) {
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
    return this.dataSource.transaction(async (manager) => {
      const verifyRepo = manager.getRepository(UserEmailVerification);
      const userRepo = manager.getRepository(User);

      const record = await verifyRepo.findOne({
        where: { token: hashed },
      });

      if (!record) throw new NotFoundException('Invalid token');
      if (record.verified_at)
        throw new BadRequestException('Email already verified');
      if (record.expires_at < new Date())
        throw new BadRequestException('Token expired');

      const now = new Date();
      record.verified_at = now;
      await verifyRepo.save(record);

      await userRepo.update(
        { id: record.user_id },
        {
          email_verified_at: now,
          is_active: true,
        },
      );

      return record.user_id;
    });
  }
}
