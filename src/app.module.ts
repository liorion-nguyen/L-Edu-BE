import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './api/users/users.module';
import { AuthModule } from './api/auth/auth.module';
import { RefreshTokenModule } from './api/refresh-token/refrehser-token.module';
import { CourseModule } from './api/courses/courses.module';
import { SessionModule } from './api/session/session.module';
import { ChatRoomModule } from './api/chat-room/chat-room.module';
import { MessageModule } from './api/message/message.module';
import { AppController } from './app.controller';
import { CloudinaryModule } from './api/cloudinary/cloudinary.module';
import { PusherModule } from './api/pusher/pusher.module';
import { OtpModule } from './api/otp/otp.module';
import { ChatModule } from './api/chat/chat.module';
import { DashboardModule } from './api/dashboard/dashboard.module';
import { ReviewModule } from './api/review/review.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    UserModule,
    AuthModule,
    RefreshTokenModule,
    CourseModule,
    SessionModule,
    ChatRoomModule,
    MessageModule,
    CloudinaryModule,
    PusherModule,
    OtpModule,
    ChatModule,
    DashboardModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}