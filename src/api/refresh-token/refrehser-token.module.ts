import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "../../api/users/users.module";
import { JwtService } from "@nestjs/jwt";
import { RefreshTokenService } from "./refrehser-token.service";
import { RefreshToken, RefreshTokenSchema } from "src/scheme/refresh-token.scheme";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    forwardRef(() => UserModule),
  ],
  providers: [RefreshTokenService, JwtService],
  exports: [RefreshTokenService, MongooseModule],
})
export class RefreshTokenModule {}