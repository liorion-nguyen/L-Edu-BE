import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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
import { RefreshTokenResponse } from 'src/payload/response/refresh-token.response';

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
}
