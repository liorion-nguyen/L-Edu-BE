import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Course, CourseSchema } from "src/scheme/course.schema";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { UserModule } from "../users/users.module";
import { SessionModule } from "../session/session.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => SessionModule),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService, MongooseModule],
})
export class CourseModule {}