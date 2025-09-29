import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailVerification, EmailVerificationDocument } from '../../scheme/email-verification.schema';
import { User } from '../../scheme/user.schema';
import { MailerService } from '../mailer/mailer.service';
import * as crypto from 'crypto';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectModel(EmailVerification.name) private emailVerificationModel: Model<EmailVerificationDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async createVerificationToken(email: string): Promise<string> {
    // Delete any existing verification token for this email
    await this.emailVerificationModel.deleteMany({ email });

    // Generate new token
    const token = this.generateVerificationToken();

    // Create new verification record
    await this.emailVerificationModel.create({
      email,
      token,
      isVerified: false,
    });

    // Send verification email
    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác thực email đăng ký tài khoản',
      template: 'email-verification',
      context: {
        verificationLink: `${process.env.URL_CLIENT}/email-verification/verify?token=${token}`,
        email,
      },
    });

    return token;
  }

  async verifyEmail(token: string): Promise<{ email: string; success: boolean }> {
    const verification = await this.emailVerificationModel.findOne({ token });
    
    if (!verification) {
      throw new BadRequestException('Token xác thực không hợp lệ hoặc đã hết hạn');
    }

    if (verification.isVerified) {
      throw new BadRequestException('Email đã được xác thực trước đó');
    }

    // Check if token is expired (1 hour)
    const tokenAge = Date.now() - verification.createdAt.getTime();
    if (tokenAge > 60 * 60 * 1000) { // 1 hour in milliseconds
      await this.emailVerificationModel.deleteOne({ _id: verification._id });
      throw new BadRequestException('Token xác thực đã hết hạn. Vui lòng đăng ký lại.');
    }

    // Mark as verified
    verification.isVerified = true;
    await verification.save();

    // Update user status to ACTIVE
    await this.userModel.updateOne(
      { email: verification.email },
      { $set: { status: 'ACTIVE' } }
    );

    return {
      email: verification.email,
      success: true,
    };
  }

  async isEmailVerified(email: string): Promise<boolean> {
    const verification = await this.emailVerificationModel.findOne({ 
      email, 
      isVerified: true 
    });
    return !!verification;
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const existingVerification = await this.emailVerificationModel.findOne({ email });
    
    if (existingVerification && existingVerification.isVerified) {
      throw new BadRequestException('Email đã được xác thực');
    }

    await this.createVerificationToken(email);
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.emailVerificationModel.deleteMany({
      createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) }, // Delete tokens older than 1 hour
    });
  }
}
