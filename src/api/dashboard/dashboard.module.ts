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
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { CourseRegistrationController } from './course-registration.controller';
import { CourseRegistrationService } from './course-registration.service';
import { User, UserSchema } from '../../scheme/user.schema';
import { Course, CourseSchema } from '../../scheme/course.schema';
import { Session, SessionSchema } from '../../scheme/session.schema';
import { Category, CategorySchema } from '../../scheme/category.schema';
import { Review, ReviewSchema } from '../../scheme/review.schema';
import { Conversation, ConversationSchema } from '../../scheme/conversation.schema';
import { ChatMessage, ChatMessageSchema } from '../../scheme/chat-message.schema';
import { CourseRegistration, CourseRegistrationSchema } from '../../scheme/course-registration.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: CourseRegistration.name, schema: CourseRegistrationSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [UserController, CourseController, SessionController, CategoryController, DashboardController, CourseRegistrationController],
  providers: [UserService, CourseService, DashboardSessionService, CategoryService, DashboardService, CourseRegistrationService],
  exports: [UserService, CourseService, DashboardSessionService, CategoryService, DashboardService, CourseRegistrationService],
})
export class DashboardModule {}
