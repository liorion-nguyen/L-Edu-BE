import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FacebookStrategy } from 'src/common/guards/facebook.strategy';
import { GitHubStrategy } from 'src/common/guards/github.strategy';
import { GoogleStrategy } from 'src/common/guards/google.strategy';
import { JwtStrategy } from 'src/common/guards/jwtStratergy';
import { RefreshTokenModule } from '../refresh-token/refrehser-token.module';
import { UserModule } from '../users/users.module';
import { UserService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => UserModule),
    forwardRef(() => RefreshTokenModule),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, FacebookStrategy, GitHubStrategy, UserService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
