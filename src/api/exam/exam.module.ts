import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ExamController } from "./exam.controller";
import { ExamService } from "./exam.service";
import { Exam, ExamAttempt, ExamAttemptSchema, ExamSchema, QuestionBank, QuestionBankSchema } from "src/scheme/exam.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Exam.name, schema: ExamSchema },
            { name: ExamAttempt.name, schema: ExamAttemptSchema },
            { name: QuestionBank.name, schema: QuestionBankSchema },
        ]),
    ],
    controllers: [ExamController],
    providers: [ExamService],
    exports: [ExamService],
})
export class ExamModule {}

