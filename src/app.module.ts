import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './api/users/users.module';
import { AuthModule } from './api/auth/auth.module';
import { RefreshTokenModule } from './api/refresh-token/refrehser-token.module';
import { CourseModule } from './api/courses/courses.module';
import { SessionModule } from './api/session/session.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ChatRoomModule } from './api/chat-room/chat-room.module';
import { MessageModule } from './api/message/message.module';
import { AppController } from './app.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: 'smtps://user@domain.com:pass@smtp.domain.com',
        defaults: {
          from: '"L Edu" <admin@ledu.com>',
        }
      }),
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    UserModule,
    AuthModule,
    RefreshTokenModule,
    CourseModule,
    SessionModule,
    ChatRoomModule,
    MessageModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}