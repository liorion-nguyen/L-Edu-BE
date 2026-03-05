import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../api/users/users.service';
import { User } from '../../scheme/user.schema';
import { Status } from '../../enums/user.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;
      
      const googleUserInfo = {
        googleId: id,
        email: emails[0].value,
        fullName: name.givenName + ' ' + name.familyName,
        avatar: photos[0].value,
        status: Status.ACTIVE, // Mặc định là ACTIVE cho Google users
      };

      // Tìm user theo email
      let existingUser = await this.userService.findByEmail(googleUserInfo.email);
      
      if (existingUser) {
        // Nếu user đã tồn tại nhưng chưa có googleId hoặc avatar, cập nhật
        if (!existingUser.googleId || (!existingUser.avatar && googleUserInfo.avatar)) {
          existingUser = await this.userService.updateGoogleUserInfo(
            existingUser._id.toString(), 
            googleUserInfo.googleId,
            googleUserInfo.avatar
          );
        }
        
        // Trả về thông tin user đầy đủ (không có password)
        const { password, ...userWithoutPassword } = existingUser.toObject ? existingUser.toObject() : existingUser;
        done(null, userWithoutPassword);
      } else {
        // Tạo user mới từ Google info
        const newUser = await this.userService.createFromGoogle(googleUserInfo);
        
        // Trả về thông tin user đầy đủ (không có password)
        const { password, ...userWithoutPassword } = newUser.toObject ? newUser.toObject() : newUser;
        done(null, userWithoutPassword);
      }
    } catch (error) {
      console.error('Google strategy validation error:', error);
      done(error, null);
    }
  }
}
