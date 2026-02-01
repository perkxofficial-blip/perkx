import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Admin, AdminPasswordReset } from '../../../entities';
import { MailService } from '../../../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(AdminPasswordReset)
    private adminPasswordResetRepository: Repository<AdminPasswordReset>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async validateAdmin(username: string, password: string): Promise<any> {
    const admin = await this.adminRepository.findOne({ where: { username } });
    if (admin && (await admin.validatePassword(password))) {
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }

  async login(admin: any) {
    const payload = {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async forgotPassword(email: string) {
    const admin = await this.adminRepository.findOne({ where: { email } });
    if (!admin) {
      throw new BadRequestException('Admin with this email does not exist');
    }

    // Invalidate any existing reset tokens
    await this.adminPasswordResetRepository.delete({ admin_id: admin.id });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save reset token
    const passwordReset = this.adminPasswordResetRepository.create({
      admin_id: admin.id,
      token: resetToken,
      expires_at: expiresAt,
    });

    await this.adminPasswordResetRepository.save(passwordReset);

    // Send reset email
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/admin/auth/reset-password?token=${resetToken}`;
    await this.mailService.sendMailResetPassword(admin.email, resetUrl);

    return { message: 'Password reset email sent successfully' };
  }

  async resetPassword(token: string, newPassword: string) {
    const passwordReset = await this.adminPasswordResetRepository.findOne({
      where: { token, used_at: null },
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date() > passwordReset.expires_at) {
      throw new BadRequestException('Reset token has expired');
    }

    const admin = await this.adminRepository.findOne({
      where: { id: passwordReset.admin_id },
    });

    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    // Update password
    admin.password = newPassword;
    await this.adminRepository.save(admin);

    // Mark token as used
    passwordReset.used_at = new Date();
    await this.adminPasswordResetRepository.save(passwordReset);

    return { message: 'Password reset successfully' };
  }
}
