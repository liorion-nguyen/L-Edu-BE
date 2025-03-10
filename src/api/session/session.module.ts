import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Session, SessionSchema } from "src/scheme/session.schema";
import { SessionController } from "./session.controller";
import { SessionService } from "./session.service";
import { CourseModule } from "../courses/courses.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    forwardRef(() => CourseModule),
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService, MongooseModule],
})
export class SessionModule {}