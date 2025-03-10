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
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    UserModule,
    AuthModule,
    RefreshTokenModule,
    CourseModule,
    SessionModule
  ],
  controllers: [],
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