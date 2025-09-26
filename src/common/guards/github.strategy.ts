import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy-client-secret',
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: Function): Promise<any> {
    const { id, username, displayName, emails, photos } = profile;
    const user = {
      email: emails?.[0]?.value || '',
      fullName: displayName || username || '',
      avatar: photos?.[0]?.value || '',
      provider: 'github',
      providerId: id,
    };
    done(null, user);
  }
} 