import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/users.module';
import { JwtStrategy } from 'src/common/guards/jwtStratergy';
import { GoogleStrategy } from 'src/common/strategies/google.strategy';
import { UserService } from '../users/users.service';
import { RefreshTokenModule } from '../refresh-token/refrehser-token.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { JWT_CONFIG } from 'src/config/jwt.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_CONFIG.SECRET,
      signOptions: { expiresIn: JWT_CONFIG.EXPIRES_IN },
    }),
    forwardRef(() => UserModule),
    forwardRef(() => RefreshTokenModule),
    EmailVerificationModule,
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, UserService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
