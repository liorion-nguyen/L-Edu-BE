import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { RefreshTokenService } from "./refrehser-token.service";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "refresh-token"
) {
  constructor(private readonly refreshTokenService: RefreshTokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET || "JWT_REFRESH_SECRET",
    });
  }

  async validate(payload: any) {
    // Validate the custom refresh token
    const userId = payload.sub;
    const token = await this.refreshTokenService.findOneByToken(
      payload.refreshToken
    );

    if (!token || new Date() > token.expiresAt) {
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }

    return { userId };
  }
}