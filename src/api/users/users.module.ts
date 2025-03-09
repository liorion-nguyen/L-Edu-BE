import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/scheme/user.schema";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";
import { AuthModule } from "../auth/auth.module";
import { RefreshTokenModule } from "../refresh-token/refrehser-token.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
    forwardRef(() => RefreshTokenModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}