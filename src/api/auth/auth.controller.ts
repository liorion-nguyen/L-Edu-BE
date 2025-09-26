import { BadRequestException, Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { successResponse } from 'src/common/dto/response.dto';
import { CommonException } from 'src/common/exception/exception';
import { SkipAuth } from 'src/config/skip.auth';
import { RefreshTokenRequest } from 'src/payload/request/refresh-token.request';
import { CreateUserRequest, LoginRequest, LogoutRequest } from 'src/payload/request/users.request';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

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

    private validateOAuthConfig(provider: string): void {
        const configs = {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET
            },
            facebook: {
                clientId: process.env.FACEBOOK_CLIENT_ID,
                clientSecret: process.env.FACEBOOK_CLIENT_SECRET
            },
            github: {
                clientId: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET
            }
        };

        const config = configs[provider];
        if (!config || !config.clientId || !config.clientSecret || 
            config.clientId.startsWith('dummy') || config.clientSecret.startsWith('dummy')) {
            throw new BadRequestException(
                `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth is not configured. Please set up ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET in your .env file.`
            );
        }
    }

    // Google OAuth
    @SkipAuth()
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req: Request) {
        this.validateOAuthConfig('google');
        // This will redirect to Google
    }

    @SkipAuth()
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
        try {
            const user = req.user as any;
            const tokens = await this.authService.validateOAuthUser(user);
            
            // Redirect to frontend with tokens
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`;
            return res.redirect(redirectUrl);
        } catch (error) {
            const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?error=${encodeURIComponent(error.message)}`;
            return res.redirect(errorUrl);
        }
    }

    // Facebook OAuth
    @SkipAuth()
    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuth(@Req() req: Request) {
        this.validateOAuthConfig('facebook');
        // This will redirect to Facebook
    }

    @SkipAuth()
    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
        try {
            const user = req.user as any;
            const tokens = await this.authService.validateOAuthUser(user);
            
            // Redirect to frontend with tokens
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`;
            return res.redirect(redirectUrl);
        } catch (error) {
            const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?error=${encodeURIComponent(error.message)}`;
            return res.redirect(errorUrl);
        }
    }

    // GitHub OAuth
    @SkipAuth()
    @Get('github')
    @UseGuards(AuthGuard('github'))
    async githubAuth(@Req() req: Request) {
        this.validateOAuthConfig('github');
        // This will redirect to GitHub
    }

    @SkipAuth()
    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
        try {
            const user = req.user as any;
            const tokens = await this.authService.validateOAuthUser(user);
            
            // Redirect to frontend with tokens
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`;
            return res.redirect(redirectUrl);
        } catch (error) {
            const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?error=${encodeURIComponent(error.message)}`;
            return res.redirect(errorUrl);
        }
    }
}
