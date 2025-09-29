import { Controller, Post, Get, Query, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { SkipAuth } from '../../config/skip.auth';
import { IsEmail, IsString } from 'class-validator';

export class ResendVerificationDto {
  @IsEmail()
  email: string;
}

@Controller('email-verification')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @SkipAuth()
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token xác thực là bắt buộc');
    }

    const result = await this.emailVerificationService.verifyEmail(token);
    return {
      message: 'Email đã được xác thực thành công',
      email: result.email,
    };
  }

  @SkipAuth()
  @Post('resend')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(@Body() resendDto: ResendVerificationDto) {
    await this.emailVerificationService.resendVerificationEmail(resendDto.email);
    return {
      message: 'Email xác thực đã được gửi lại',
    };
  }

  @SkipAuth()
  @Get('check')
  @HttpCode(HttpStatus.OK)
  async checkEmailVerification(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email là bắt buộc');
    }

    const isVerified = await this.emailVerificationService.isEmailVerified(email);
    return {
      email,
      isVerified,
    };
  }
}
