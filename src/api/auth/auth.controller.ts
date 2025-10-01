import { Body, Controller, Get, HttpStatus, Post, Request, Response, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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

    @SkipAuth()
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Guard sẽ redirect đến Google OAuth
    }

    @SkipAuth()
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(@Request() req, @Response() res) {
        try {
            const result = await this.authService.googleLogin(req.user);
            
            // Redirect to frontend with tokens and user info
            const frontendUrl = process.env.URL_CLIENT || 'http://localhost:3000';
            const params = new URLSearchParams({
                access_token: result.access_token,
                refresh_token: result.refresh_token,
                user_info: JSON.stringify(result.user)
            });
            const redirectUrl = `${frontendUrl}/auth/google/callback?${params.toString()}`;
            
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('Google callback error:', error);
            const frontendUrl = process.env.URL_CLIENT || 'http://localhost:3000';
            res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
        }
    }
}
