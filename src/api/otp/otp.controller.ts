import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ForgotPasswordDto, VerifyOtpDto } from './dto/forgot-password.dto';
import { SkipAuth } from '../../config/skip.auth';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
  ) {}

  @SkipAuth()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.otpService.createAndSendOTP(forgotPasswordDto.email);
    return {
      message: 'OTP has been sent to your email',
    };
  }

  @SkipAuth()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    await this.otpService.verifyOTP(
      verifyOtpDto.email,
      verifyOtpDto.code,
    );
    return {
      message: 'OTP verified successfully. New password has been sent to your email.',
    };
  }
}