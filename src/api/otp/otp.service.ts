import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from '../../scheme/otp.schema';
import { UserService } from '../users/users.service';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private readonly usersService: UserService,
    private readonly mailerService: MailerService,
  ) {}

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createAndSendOTP(email: string): Promise<void> {
    // Check if user exists
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate OTP
    const code = this.generateOTP();

    // Delete any existing OTP for this email
    await this.otpModel.deleteMany({ email });
    
    // Create new OTP
    await this.otpModel.create({
      email,
      code,
    });

    // Send OTP via email
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset OTP',
      template: 'forgot-password',
      context: {
        code,
      },
    });
  }

  private generateRandomPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  async verifyOTP(email: string, code: string): Promise<void> {
    const otp = await this.otpModel.findOne({ email, code });
    
    if (!otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Check if OTP is expired (5 minutes)
    const otpAge = Date.now() - otp.createdAt.getTime();
    if (otpAge > 5 * 60 * 1000) { // 5 minutes in milliseconds
      // Delete expired OTP
      await this.otpModel.deleteOne({ _id: otp._id });
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Delete the OTP after verification
    await this.otpModel.deleteOne({ _id: otp._id });

    // Generate new password
    const newPassword = this.generateRandomPassword();

    // Update user password
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update password (hashing is handled in UserService)
    await this.usersService.updatePassword(user._id.toString(), newPassword);

    // Send new password via email
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your New Password',
      template: 'new-password',
      context: {
        newPassword,
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE, { name: 'cleanup-expired-otps' })
  async deleteExpiredOTPs(): Promise<void> {
    const result = await this.otpModel.deleteMany({
      createdAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) }, // Delete OTPs older than 5 minutes
    });
    if (result.deletedCount > 0) {
      console.log(`Deleted ${result.deletedCount} expired OTPs`);
    }
  }
}