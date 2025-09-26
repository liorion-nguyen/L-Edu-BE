import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'dummy-client-secret',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'photos'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: Function): Promise<any> {
    const { id, name, emails, photos } = profile;
    const user = {
      email: emails?.[0]?.value || '',
      fullName: `${name?.givenName || ''} ${name?.familyName || ''}`,
      avatar: photos?.[0]?.value || '',
      provider: 'facebook',
      providerId: id,
    };
    done(null, user);
  }
} 