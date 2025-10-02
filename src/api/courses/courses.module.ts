import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Course, CourseSchema } from "src/scheme/course.schema";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { UserModule } from "../users/users.module";
import { SessionModule } from "../session/session.module";
import { CategoryService } from "../dashboard/category.service";
import { Category, CategorySchema } from "src/scheme/category.schema";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Category.name, schema: CategorySchema }
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => SessionModule),
    forwardRef(() => CloudinaryModule),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CategoryService],
  exports: [CoursesService, MongooseModule],
})
export class CourseModule {}