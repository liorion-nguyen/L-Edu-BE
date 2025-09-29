import { Body, Controller, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { successResponse } from 'src/common/dto/response.dto';
import { CommonException } from 'src/common/exception/exception';
import { CreateUserRequest, LoginRequest, LogoutRequest } from 'src/payload/request/users.request';
import { AuthService } from './auth.service';
import { SkipAuth } from 'src/config/skip.auth';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenRequest } from 'src/payload/request/refresh-token.request';
import { EmailVerificationService } from '../email-verification/email-verification.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly emailVerificationService: EmailVerificationService,
    ) { }

    @SkipAuth()
    @Post('login')
    async Login(@Body() loginRequest: LoginRequest) {
        try {
            return successResponse(await this.authService.Login(loginRequest));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @SkipAuth()
    @Post('signup')
    async CreateUser(@Body() body: CreateUserRequest) {
        try {
            return successResponse(await this.authService.CreateUser(body));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @SkipAuth()
    @Post("refresh-token")
    async refreshToken(@Body() refreshTokenRequest: RefreshTokenRequest) {
        return successResponse(
            await this.authService.refreshToken(refreshTokenRequest)
        );
    }

    @Post("logout")
    async logout(@Body() authLogoutRequest: LogoutRequest) {
        await this.authService.logout(authLogoutRequest);
        return successResponse({ message: "Logged out successfully" });
    }

    @SkipAuth()
    @Post('resend-verification')
    async resendVerificationEmail(@Body() body: { email: string }) {
        try {
            await this.emailVerificationService.resendVerificationEmail(body.email);
            return successResponse({ message: 'Email xác thực đã được gửi lại' });
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post("change-password")
    async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
        try {
            await this.authService.changePassword(
                req.user._id,
                changePasswordDto.currentPassword,
                changePasswordDto.newPassword
            );
            return successResponse({ message: "Password changed successfully" });
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
