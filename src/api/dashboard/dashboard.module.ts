import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { SessionController } from './session.controller';
import { DashboardSessionService } from './session.service';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { User, UserSchema } from '../../scheme/user.schema';
import { Course, CourseSchema } from '../../scheme/course.schema';
import { Session, SessionSchema } from '../../scheme/session.schema';
import { Category, CategorySchema } from '../../scheme/category.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [UserController, CourseController, SessionController, CategoryController],
  providers: [UserService, CourseService, DashboardSessionService, CategoryService],
  exports: [UserService, CourseService, DashboardSessionService, CategoryService],
})
export class DashboardModule {}
