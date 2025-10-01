import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserRequest, LoginRequest, LogoutRequest } from 'src/payload/request/users.request';
import { User } from 'src/scheme/user.schema';
import { UserService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from "crypto";
import { CommonException } from 'src/common/exception/exception';
import { LoginResponse } from 'src/payload/response/users.response';
import { RefreshToken } from 'src/scheme/refresh-token.scheme';
import { RefreshTokenService } from '../refresh-token/refrehser-token.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRequest } from 'src/payload/request/refresh-token.request';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { RefreshTokenResponse } from 'src/payload/response/refresh-token.response';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly userService: UserService,
        private readonly refreshTokenService: RefreshTokenService,
        private readonly jwtService: JwtService,
        private readonly emailVerificationService: EmailVerificationService,
    ) { }

    async validateUser(authRequest: LoginRequest): Promise<any> {
        const user = await this.userService.findUserByEmail(authRequest.email);
        if (user && (await bcrypt.compare(authRequest.password, user.password))) {
            // Check if user status is ACTIVE
            if (user.status === 'INACTIVE') {
                throw new BadRequestException('Tài khoản chưa được kích hoạt. Vui lòng xác thực email để kích hoạt tài khoản.');
            }
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    // Authentification
    async Login(loginRequest: LoginRequest): Promise<LoginResponse> {
        try {
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
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error; // Re-throw email verification error
            }
            throw new CommonException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }
    }

    async CreateUser(body: CreateUserRequest): Promise<{ user: User; message: string }> {
        const userExist = await this.userService.findUserByEmail(body.email);
        if (userExist) {
            throw new BadRequestException(`User with email ${body.email} already exist`);
        }
        
        const hashPassword = await bcrypt.hash(body.password, 10);
        body.password = hashPassword;
        
        // Set status to INACTIVE for new users
        const userData = {
            ...body,
            status: 'INACTIVE'
        };
        
        const user = new this.userModel(userData);
        const savedUser = await user.save();
        
        // Send email verification
        await this.emailVerificationService.createVerificationToken(body.email);
        
        return {
            user: savedUser,
            message: 'Tài khoản đã được tạo thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
        };
    }

    async refreshToken(
        refreshTokenRequest: RefreshTokenRequest
    ): Promise<RefreshTokenResponse> {
        return await this.refreshTokenService.refreshToken(refreshTokenRequest);
    }

    async logout(refresh_token: LogoutRequest) {
        await this.refreshTokenService.deleteToken(refresh_token);
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Hash new password
        const hashPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await this.userModel.updateOne(
            { _id: userId },
            { $set: { password: hashPassword } }
        );
    }

    async googleLogin(user: any): Promise<{ access_token: string; refresh_token: string; user: any }> {
        try {
            const payload = { email: user.email, sub: user._id, role: user.role };
            const access_token = this.jwtService.sign(payload, {
                secret: process.env.JWT_SECRET || "JWT_SECRET",
                expiresIn: "7d",
            });
            const refresh_token = crypto.randomBytes(16).toString("hex");
            await this.refreshTokenService.storeToken(user._id, refresh_token);
            
            // Trả về cả token và thông tin user
            return { 
                access_token, 
                refresh_token,
                user: {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    avatar: user.avatar,
                    role: user.role,
                    status: user.status,
                    googleId: user.googleId
                }
            };
        } catch (error) {
            throw new CommonException("Google login failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
