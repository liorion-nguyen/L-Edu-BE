import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../api/users/users.service";
import { RefreshToken } from "src/scheme/refresh-token.scheme";
import { RefreshTokenRequest } from "src/payload/request/refresh-token.request";
import { RefreshTokenResponse } from "src/payload/response/refresh-token.response";
import { LogoutRequest } from "src/payload/request/users.request";

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  async storeToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenModel.updateOne(
      { userId },
      { refresh_token: token, expiresAt },
      { upsert: true }
    );
  }

  async refreshToken(
    refreshTokenRequest: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const { refresh_token } = refreshTokenRequest;
    const token = await this.findOneByToken(refresh_token);

    if (!token || new Date() > token.expiresAt) {
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }

    const user = await this.userService.findUserById(token.userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const payload = { email: user.email, sub: user._id };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || "JWT_SECRET",
      expiresIn: "7d",
    });

    return { access_token };
  }

  async deleteToken(logoutRequest: LogoutRequest): Promise<void> {
    const { refresh_token } = logoutRequest;
    await this.refreshTokenModel.deleteOne({ refresh_token }).exec();
  }

  async findOneByToken(refresh_token: string): Promise<RefreshToken | null> {
    return this.refreshTokenModel.findOne({ refresh_token }).exec();
  }
}