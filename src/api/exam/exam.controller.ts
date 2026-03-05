import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ExamService } from "./exam.service";
import { CreateExamDto, UpdateExamDto } from "./dto/exam-config.dto";
import { CreateAttemptDto, SaveAttemptProgressDto, SubmitAttemptDto } from "./dto/attempt.dto";
import { Request } from "express";
import { SkipAuth } from "src/config/skip.auth";

@Controller("exam")
export class ExamController {
    constructor(private readonly examService: ExamService) {}

    @Post()
    createExam(@Body() payload: CreateExamDto) {
        return this.examService.createExam(payload);
    }

    @Patch(":examId")
    updateExam(@Param("examId") examId: string, @Body() payload: UpdateExamDto) {
        return this.examService.updateExam(examId, payload);
    }

    @Post(":examId/publish")
    publishExam(@Param("examId") examId: string) {
        return this.examService.publishExam(examId);
    }

    @Get()
    @SkipAuth()
    listExams(
        @Query("instructorId") instructorId?: string,
        @Query("courseId") courseId?: string,
        @Query("visibility") visibility?: string,
    ) {
        return this.examService.listExams({
            instructorId,
            courseId,
            visibility: visibility as any,
        });
    }

    @Get(":examId")
    @SkipAuth()
    getExamDetail(@Param("examId") examId: string) {
        return this.examService.getExamDetail(examId);
    }

    @Get(":examId/overview")
    @SkipAuth()
    getExamOverview(@Param("examId") examId: string) {
        return this.examService.getExamOverview(examId);
    }

    @Post(":examId/attempt")
    createAttempt(@Param("examId") examId: string, @Body() payload: CreateAttemptDto) {
        return this.examService.createAttempt(examId, payload);
    }

    @Get(":examId/attempt/:attemptId")
    getAttempt(
        @Param("examId") examId: string,
        @Param("attemptId") attemptId: string,
    ) {
        return this.examService.getAttempt(examId, attemptId);
    }

    @Get(":examId/attempts")
    listAttempts(
        @Param("examId") examId: string,
        @Query() query: { studentId?: string; from?: string; to?: string },
        @Req() req: Request,
    ) {
        return this.examService.listAttempts(examId, {
            requester: (req as any)?.user,
            studentId: query?.studentId,
            from: query?.from,
            to: query?.to,
        });
    }

    @Patch(":examId/attempt/:attemptId")
    saveAttemptProgress(
        @Param("examId") examId: string,
        @Param("attemptId") attemptId: string,
        @Body() payload: SaveAttemptProgressDto,
    ) {
        return this.examService.saveAttemptProgress(examId, attemptId, payload);
    }

    @Post(":examId/attempt/:attemptId/submit")
    submitAttempt(
        @Param("examId") examId: string,
        @Param("attemptId") attemptId: string,
        @Body() payload: SubmitAttemptDto,
    ) {
        return this.examService.submitAttempt(examId, attemptId, payload);
    }
}

