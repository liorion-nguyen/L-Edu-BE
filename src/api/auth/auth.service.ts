import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from "crypto";
import { Model } from 'mongoose';
import { CommonException } from 'src/common/exception/exception';
import { RefreshTokenRequest } from 'src/payload/request/refresh-token.request';
import { CreateUserRequest, LoginRequest, LogoutRequest } from 'src/payload/request/users.request';
import { RefreshTokenResponse } from 'src/payload/response/refresh-token.response';
import { LoginResponse } from 'src/payload/response/users.response';
import { User } from 'src/scheme/user.schema';
import { RefreshTokenService } from '../refresh-token/refrehser-token.service';
import { UserService } from '../users/users.service';

interface OAuthUser {
    email: string;
    fullName: string;
    avatar: string;
    provider: string;
    providerId: string;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly userService: UserService,
        private readonly refreshTokenService: RefreshTokenService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(authRequest: LoginRequest): Promise<any> {
        const user = await this.userService.findUserByEmail(authRequest.email);
        if (user && (await bcrypt.compare(authRequest.password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    // Authentification
    async Login(loginRequest: LoginRequest): Promise<LoginResponse> {
        const user = await this.validateUser(loginRequest);
        if (!user) {
            throw new CommonException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }
        if (user.status === "INACTIVE") {
            throw new CommonException("User is inactive", HttpStatus.UNAUTHORIZED);
        }
        const payload = { email: user.email, sub: user._id, role: user.role };
        const access_token = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET || "JWT_SECRET",
            expiresIn: "7d",
        });
        const refresh_token = crypto.randomBytes(16).toString("hex");
        await this.refreshTokenService.storeToken(user._id, refresh_token);
        return { access_token, refresh_token };
    }

    async CreateUser(body: CreateUserRequest): Promise<User> {
        const userExist = await this.userService.findUserByEmail(body.email);
        if (userExist) {
            throw new NotFoundException(`User with email ${body.email} already exist`);
        }
        const hashPassword = await bcrypt.hash(body.password, 10);
        body.password = hashPassword;
        const user = new this.userModel(body);
        return user.save();
    }

    async refreshToken(
        refreshTokenRequest: RefreshTokenRequest
    ): Promise<RefreshTokenResponse> {
        return await this.refreshTokenService.refreshToken(refreshTokenRequest);
    }

    async logout(refresh_token: LogoutRequest) {
        await this.refreshTokenService.deleteToken(refresh_token);
    }

    // OAuth Authentication
    async validateOAuthUser(oauthUser: OAuthUser): Promise<LoginResponse> {
        // First, check if user exists with the same email
        let user = await this.userService.findUserByEmail(oauthUser.email);
        
        if (!user) {
            // Create new user if doesn't exist
            user = await this.createOAuthUser(oauthUser);
        } else {
            // Update existing user with OAuth info if needed
            if (!user.provider || !user.providerId) {
                user.provider = oauthUser.provider;
                user.providerId = oauthUser.providerId;
                user.avatar = oauthUser.avatar;
                await user.save();
            }
        }

        if (user.status === "INACTIVE") {
            throw new CommonException("User is inactive", HttpStatus.UNAUTHORIZED);
        }

        // Generate JWT token
        const payload = { email: user.email, sub: user._id, role: user.role };
        const access_token = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET || "JWT_SECRET",
            expiresIn: "7d",
        });
        const refresh_token = crypto.randomBytes(16).toString("hex");
        await this.refreshTokenService.storeToken(user._id.toString(), refresh_token);
        
        return { access_token, refresh_token };
    }

    private async createOAuthUser(oauthUser: OAuthUser): Promise<User> {
        const newUser = new this.userModel({
            email: oauthUser.email,
            fullName: oauthUser.fullName,
            avatar: oauthUser.avatar,
            provider: oauthUser.provider,
            providerId: oauthUser.providerId,
            // Don't set password for OAuth users
        });
        
        return await newUser.save();
    }
}
