import { MailerModule } from '@nestjs-modules/mailer';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './api/auth/auth.module';
import { ChatRoomModule } from './api/chat-room/chat-room.module';
import { CloudinaryModule } from './api/cloudinary/cloudinary.module';
import { CourseModule } from './api/courses/courses.module';
import { ChatGateway } from './api/gateway/chat.gateway';
import { MessageModule } from './api/message/message.module';
import { PusherModule } from './api/pusher/pusher.module';
import { RefreshTokenModule } from './api/refresh-token/refrehser-token.module';
import { SessionModule } from './api/session/session.module';
import { UserModule } from './api/users/users.module';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
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
    MongooseModule.forRoot(process.env.MONGO_URI),
    UserModule,
    AuthModule,
    RefreshTokenModule,
    CourseModule,
    SessionModule,
    ChatRoomModule,
    MessageModule,
    CloudinaryModule,
    PusherModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ChatGateway
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}