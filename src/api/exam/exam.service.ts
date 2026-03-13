import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { CreateExamDto, UpdateExamDto } from "./dto/exam-config.dto";
import {
    AttemptAnswer,
    Exam,
    ExamAttempt,
    ExamAttemptStatus,
    ExamQuestion,
    ExamQuestionType,
    ExamVisibility,
} from "src/scheme/exam.schema";
import { CreateAttemptDto, SaveAttemptProgressDto, SubmitAttemptDto } from "./dto/attempt.dto";
import { Role } from "src/enums/user.enum";

interface ListAttemptsOptions {
    requester?: {
        _id?: string;
        role?: Role | string;
    };
    studentId?: string;
    from?: string;
    to?: string;
}

@Injectable()
export class ExamService {
    constructor(
        @InjectModel(Exam.name) private readonly examModel: Model<Exam>,
        @InjectModel(ExamAttempt.name) private readonly attemptModel: Model<ExamAttempt>,
    ) {}

    async listExams(filterParams: {
        instructorId?: string;
        courseId?: string;
        visibility?: ExamVisibility;
        search?: string;
        studentId?: string;
        createdFrom?: string;
        createdTo?: string;
    }) {
        const filter: FilterQuery<Exam> = {};
        if (filterParams.instructorId) {
            filter.instructorId = filterParams.instructorId;
        }
        if (filterParams.courseId) {
            filter.courseId = filterParams.courseId;
        }
        if (filterParams.visibility) {
            filter.visibility = filterParams.visibility;
        }
        if (filterParams.search && filterParams.search.trim()) {
            filter.title = { $regex: filterParams.search.trim(), $options: "i" };
        }
        if (filterParams.createdFrom || filterParams.createdTo) {
            filter.createdAt = {};
            if (filterParams.createdFrom) {
                filter.createdAt.$gte = new Date(filterParams.createdFrom);
            }
            if (filterParams.createdTo) {
                const to = new Date(filterParams.createdTo);
                to.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = to;
            }
        }
        if (filterParams.studentId && filterParams.studentId.trim()) {
            const attemptExamIds = await this.attemptModel
                .distinct("examId", { studentId: filterParams.studentId.trim() })
                .exec();
            if (attemptExamIds.length === 0) {
                filter._id = { $in: [] };
            } else {
                filter._id = { $in: attemptExamIds };
            }
        }

        const exams = await this.examModel
            .find(filter, {
                title: 1,
                courseId: 1,
                sessionIds: 1,
                totalPoints: 1,
                visibility: 1,
                config: 1,
                createdAt: 1,
                updatedAt: 1,
            })
            .sort({ createdAt: -1 })
            .lean();

        return exams;
    }

    async createExam(payload: CreateExamDto) {
        if (payload.config.startTime && payload.config.endTime) {
            const start = new Date(payload.config.startTime);
            const end = new Date(payload.config.endTime);
            if (start >= end) {
                throw new BadRequestException("endTime must be greater than startTime");
            }
        }

        const questions = payload.questions.map((question, index) => {
            const questionId =
                question.id && Types.ObjectId.isValid(question.id)
                    ? question.id
                    : new Types.ObjectId().toHexString();

            const optionIdMap = new Map<string, string>();
            const options = (question.options ?? []).map((option, optionIndex) => {
                const originalOptionId = option.id;
                const optionId =
                    originalOptionId && Types.ObjectId.isValid(originalOptionId)
                        ? originalOptionId
                        : new Types.ObjectId().toHexString();
                if (originalOptionId && originalOptionId !== optionId) {
                    optionIdMap.set(originalOptionId, optionId);
                }
                return {
                    ...option,
                    id: optionId,
                };
            });

            const correctAnswers = question.correctAnswers?.map((answer) => {
                if (!answer) return answer;
                if (Types.ObjectId.isValid(answer)) return answer;
                const mapped = optionIdMap.get(answer);
                return mapped ?? answer;
            });

            return {
                ...question,
                id: questionId,
                options,
                correctAnswers,
                order: typeof question.order === "number" ? question.order : index,
            };
        });
        const totalPoints = questions.reduce((acc, question) => acc + question.points, 0);
        const config = {
            ...payload.config,
            startTime: payload.config.startTime ? new Date(payload.config.startTime) : undefined,
            endTime: payload.config.endTime ? new Date(payload.config.endTime) : undefined,
        };

        const exam = new this.examModel({
            ...payload,
            sessionIds: payload.sessionIds ?? [],
            questions,
            totalPoints,
            config,
            visibility: ExamVisibility.DRAFT,
        });

        await exam.save();
        const created = await this.examModel.findById(exam._id).lean();
        if (!created) {
            throw new InternalServerErrorException("Failed to create exam");
        }
        return created;
    }

    async updateExam(examId: string, payload: UpdateExamDto) {
        const exam = await this.examModel.findById(examId);
        if (!exam) {
            throw new NotFoundException("Exam not found");
        }

        if (payload.config) {
            if (payload.config.startTime && payload.config.endTime) {
                const start = new Date(payload.config.startTime);
                const end = new Date(payload.config.endTime);
                if (start >= end) {
                    throw new BadRequestException("endTime must be greater than startTime");
                }
            }
            exam.config = {
                ...exam.config,
                ...payload.config,
                startTime: payload.config.startTime ? new Date(payload.config.startTime) : exam.config?.startTime,
                endTime: payload.config.endTime ? new Date(payload.config.endTime) : exam.config?.endTime,
            };
        }

        if (payload.questions) {
            exam.questions = payload.questions.map((question, index) => {
                const questionId =
                    question.id && Types.ObjectId.isValid(question.id)
                        ? question.id
                        : new Types.ObjectId().toHexString();

                const optionIdMap = new Map<string, string>();
                const options = (question.options ?? []).map((option) => {
                    const originalOptionId = option.id;
                    const optionId =
                        originalOptionId && Types.ObjectId.isValid(originalOptionId)
                            ? originalOptionId
                            : new Types.ObjectId().toHexString();
                    if (originalOptionId && originalOptionId !== optionId) {
                        optionIdMap.set(originalOptionId, optionId);
                    }
                    return {
                        ...option,
                        id: optionId,
                    };
                });

                const correctAnswers = question.correctAnswers?.map((answer) => {
                    if (!answer) return answer;
                    if (Types.ObjectId.isValid(answer)) return answer;
                    const mapped = optionIdMap.get(answer);
                    return mapped ?? answer;
                });

                return {
                    ...question,
                    id: questionId,
                    options,
                    correctAnswers,
                    order: typeof question.order === "number" ? question.order : index,
                };
            }) as unknown as ExamQuestion[];
            exam.totalPoints = exam.questions.reduce((acc, question) => acc + question.points, 0);
        }

        if (payload.title !== undefined) {
            exam.title = payload.title;
        }
        if (payload.description !== undefined) {
            exam.description = payload.description;
        }
        if ((payload as any).courseId !== undefined) {
            exam.courseId = (payload as any).courseId;
        }
        if (payload.sessionIds) {
            exam.sessionIds = payload.sessionIds;
        }

        await exam.save();
        return exam.toObject();
    }

    async publishExam(examId: string) {
        const exam = await this.examModel.findByIdAndUpdate(
            examId,
            { visibility: ExamVisibility.PUBLISHED },
            { new: true },
        );
        if (!exam) {
            throw new NotFoundException("Exam not found");
        }
        return exam.toObject();
    }

    async deleteExam(examId: string) {
        const exam = await this.examModel.findById(examId).lean();
        if (!exam) {
            throw new NotFoundException("Exam not found");
        }

        await this.attemptModel.deleteMany({ examId: examId as any });
        await this.examModel.deleteOne({ _id: examId as any });

        return { message: "Exam deleted successfully" };
    }

    async getExamDetail(examId: string) {
        const exam = await this.examModel.findById(examId);
        if (!exam) {
            throw new NotFoundException("Exam not found");
        }

        await this.normalizeExamQuestionData(exam);
        return exam.toObject();
    }

    async getExamOverview(examId: string) {
        const exam = await this.examModel
            .findById(examId,
                {
                    title: 1,
                    description: 1,
                    config: 1,
                    totalPoints: 1,
                    visibility: 1,
                })
            .lean();

        if (!exam) {
            throw new NotFoundException("Exam not found");
        }
        return exam;
    }

    private ensureExamAccessible(exam: Exam, studentId?: string) {
        if (exam.visibility !== ExamVisibility.PUBLISHED) {
            throw new ForbiddenException("Exam is not published");
        }

        const now = new Date();
        if (exam.config.startTime && now < new Date(exam.config.startTime)) {
            throw new ForbiddenException("Exam has not started yet");
        }

        if (exam.config.endTime && now > new Date(exam.config.endTime)) {
            throw new ForbiddenException("Exam has already ended");
        }

        if (!studentId) {
            throw new BadRequestException("Missing student information");
        }
    }

    async createAttempt(examId: string, payload: CreateAttemptDto) {
        const exam = await this.examModel.findById(examId);
        if (!exam) {
            throw new NotFoundException("Exam not found");
        }

        await this.normalizeExamQuestionData(exam);
        this.ensureExamAccessible(exam, payload.studentId);

        const existingAttempt = await this.attemptModel.findOne({
            examId,
            studentId: payload.studentId,
            status: { $in: [ExamAttemptStatus.IN_PROGRESS] },
        });

        if (existingAttempt) {
            return existingAttempt.toObject();
        }

        const attempt = new this.attemptModel({
            examId,
            studentId: payload.studentId,
            startedAt: new Date(),
            status: ExamAttemptStatus.IN_PROGRESS,
            answers: [],
            maxScore: exam.totalPoints,
            deviceInfo: payload.deviceInfo ?? {},
        });

        await attempt.save();
        return attempt.toObject();
    }

    async getAttempt(examId: string, attemptId: string) {
        const attempt = await this.attemptModel.findOne({ _id: attemptId, examId }).lean();
        if (!attempt) {
            throw new NotFoundException("Attempt not found");
        }
        return attempt;
    }

    async listAttempts(examId: string, options: ListAttemptsOptions = {}) {
        const { requester, studentId, from, to } = options;
        if (!requester?._id || !requester?.role) {
            throw new ForbiddenException("Unauthorized");
        }

        const exam = await this.examModel.findById(examId);
        if (!exam) {
            throw new NotFoundException("Exam not found");
        }

        await this.normalizeExamQuestionData(exam);

        const requesterRole = requester.role as Role;
        const requesterId = requester._id?.toString?.() ?? requester._id;

        if (requesterRole === Role.TEACHER) {
            if (exam.instructorId && exam.instructorId.toString() !== requesterId) {
                throw new ForbiddenException("Bạn không có quyền xem lịch sử bài làm của bài kiểm tra này");
            }
        }

        let effectiveStudentId: string | undefined;
        if (requesterRole === Role.STUDENT) {
            effectiveStudentId = requesterId;
        } else if (studentId) {
            effectiveStudentId = studentId;
        }

        const filter: FilterQuery<ExamAttempt> = { examId };
        if (effectiveStudentId) {
            filter.studentId = effectiveStudentId;
        }

        if (from || to) {
            const startedAtFilter: Record<string, Date> = {};
            if (from && !Number.isNaN(Date.parse(from))) {
                startedAtFilter.$gte = new Date(from);
            }
            if (to && !Number.isNaN(Date.parse(to))) {
                startedAtFilter.$lte = new Date(to);
            }
            if (Object.keys(startedAtFilter).length > 0) {
                filter.startedAt = startedAtFilter as any;
            }
        }

        const attempts = await this.attemptModel
            .find(filter, {
                examId: 1,
                studentId: 1,
                startedAt: 1,
                submittedAt: 1,
                status: 1,
                totalScore: 1,
                maxScore: 1,
                answers: 1,
                createdAt: 1,
                updatedAt: 1,
            })
            .sort({ startedAt: -1 })
            .populate("studentId", "fullName email avatar")
            .lean();

        return attempts.map((attempt) => {
            const populatedStudent = attempt.studentId as any;
            const normalizedStudent =
                populatedStudent &&
                typeof populatedStudent === "object" &&
                "fullName" in populatedStudent
                    ? {
                          _id: populatedStudent?._id?.toString?.() ?? populatedStudent?._id,
                          fullName: populatedStudent?.fullName,
                          email: populatedStudent?.email,
                          avatar: populatedStudent?.avatar,
                      }
                    : undefined;

            return {
                ...attempt,
                _id: attempt._id?.toString?.() ?? attempt._id,
                examId: (attempt.examId as any)?.toString?.() ?? attempt.examId,
                studentId:
                    typeof attempt.studentId === "string"
                        ? attempt.studentId
                        : populatedStudent?._id?.toString?.() ?? populatedStudent,
                student: normalizedStudent,
            };
        });
    }

    async saveAttemptProgress(examId: string, attemptId: string, payload: SaveAttemptProgressDto) {
        const attempt = await this.attemptModel.findOne({ _id: attemptId, examId });
        if (!attempt) {
            throw new NotFoundException("Attempt not found");
        }

        if (attempt.status !== ExamAttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Attempt already submitted");
        }

        const answersMap = new Map<string, AttemptAnswer>();
        attempt.answers.forEach((answer) => {
            answersMap.set(answer.questionId.toString(), answer);
        });

        payload.answers.forEach((incoming) => {
            const key = incoming.questionId;
            const existing = answersMap.get(key);
            if (existing) {
                existing.selectedOptionIds = incoming.selectedOptionIds ?? existing.selectedOptionIds;
                existing.textAnswer = incoming.textAnswer ?? existing.textAnswer;
            } else {
                if (!Types.ObjectId.isValid(key)) {
                    throw new BadRequestException(`Invalid question id: ${key}`);
                }
                answersMap.set(key, {
                    questionId: new Types.ObjectId(key) as any,
                    selectedOptionIds: incoming.selectedOptionIds?.filter(Boolean),
                    textAnswer: incoming.textAnswer,
                });
            }
        });

        attempt.answers = Array.from(answersMap.values());
        attempt.deviceInfo = { ...(attempt.deviceInfo ?? {}), ...(payload.deviceInfo ?? {}) };
        await attempt.save();

        return attempt.toObject();
    }

    async submitAttempt(examId: string, attemptId: string, payload: SubmitAttemptDto = {}) {
        const exam = await this.examModel.findById(examId);
        if (!exam) {
            throw new NotFoundException("Exam not found");
        }

        const attempt = await this.attemptModel.findOne({ _id: attemptId, examId });
        if (!attempt) {
            throw new NotFoundException("Attempt not found");
        }

        if (attempt.status !== ExamAttemptStatus.IN_PROGRESS && !payload.forceSubmit) {
            return attempt.toObject();
        }

        await this.normalizeExamQuestionData(exam);

        const graded = this.gradeAttempt(exam, attempt);
        attempt.answers = graded.answers;
        attempt.totalScore = graded.totalScore;
        attempt.maxScore = graded.maxScore;
        attempt.status = payload.status ?? ExamAttemptStatus.SUBMITTED;
        attempt.submittedAt = new Date();

        await attempt.save();
        return attempt.toObject();
    }

    private gradeAttempt(exam: Exam, attempt: ExamAttempt) {
        const questionsById = new Map<string, ExamQuestion>();
        exam.questions.forEach((question) => {
            const candidateId = (question as any).id;
            const fallbackId = (question as any)._id;
            const id =
                candidateId && Types.ObjectId.isValid(candidateId)
                    ? candidateId.toString()
                    : fallbackId
                    ? fallbackId.toString()
                    : undefined;
            if (id) {
                questionsById.set(id, question);
            }
        });

        const existingAnswers = new Map<string, AttemptAnswer>();
        attempt.answers.forEach((answer) => {
            existingAnswers.set(answer.questionId.toString(), answer);
        });

        let totalScore = 0;
        const gradedAnswers: AttemptAnswer[] = [];

        questionsById.forEach((question, questionId) => {
            const currentAnswer = existingAnswers.get(questionId) ?? {
                questionId: new Types.ObjectId(questionId) as any,
                selectedOptionIds: [],
                textAnswer: undefined,
            };

            const evaluation = this.evaluateAnswer(question, currentAnswer);
            totalScore += evaluation.scoreEarned ?? 0;

            gradedAnswers.push({
                ...currentAnswer,
                isCorrect: evaluation.isCorrect,
                scoreEarned: evaluation.scoreEarned,
                autoGraded: evaluation.autoGraded,
            } as AttemptAnswer);
        });

        return {
            answers: gradedAnswers,
            totalScore,
            maxScore: exam.totalPoints,
        };
    }

    private async normalizeExamQuestionData(exam: Exam) {
        let updated = false;

        (exam.questions ?? []).forEach((question: any) => {
            if (!question.id || !Types.ObjectId.isValid(question.id)) {
                question.id = new Types.ObjectId().toHexString();
                updated = true;
            }

            const optionIdMap = new Map<string, string>();
            if (Array.isArray(question.options)) {
                question.options.forEach((option: any) => {
                    const originalId = option.id;
                    if (!originalId || !Types.ObjectId.isValid(originalId)) {
                        const newId = new Types.ObjectId().toHexString();
                        if (originalId) {
                            optionIdMap.set(originalId, newId);
                        }
                        option.id = newId;
                        updated = true;
                    }
                });
            }

            if (Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0) {
                const nextAnswers = question.correctAnswers.map((answer: string) => {
                    if (!answer) return answer;
                    if (Types.ObjectId.isValid(answer)) return answer;
                    return optionIdMap.get(answer) ?? answer;
                });
                if (JSON.stringify(nextAnswers) !== JSON.stringify(question.correctAnswers)) {
                    question.correctAnswers = nextAnswers;
                    updated = true;
                }
            }
        });

        if (updated) {
            exam.markModified("questions");
            await exam.save();
        }
    }

    private evaluateAnswer(question: ExamQuestion, answer: AttemptAnswer) {
        switch (question.type) {
            case ExamQuestionType.SINGLE: {
                const correct = question.correctAnswers?.[0];
                const selected = answer.selectedOptionIds?.[0];
                const isCorrect = Boolean(correct && selected && correct === selected);
                return {
                    isCorrect,
                    scoreEarned: isCorrect ? question.points : 0,
                    autoGraded: true,
                };
            }
            case ExamQuestionType.MULTIPLE: {
                const expected = new Set(question.correctAnswers ?? []);
                const selected = new Set(answer.selectedOptionIds ?? []);
                if (expected.size === 0) {
                    return { isCorrect: false, scoreEarned: 0, autoGraded: true };
                }
                let correctCount = 0;
                expected.forEach((value) => {
                    if (selected.has(value)) {
                        correctCount += 1;
                    }
                });
                const hasExtraSelection = Array.from(selected).some((value) => !expected.has(value));
                const isCorrect = !hasExtraSelection && correctCount === expected.size && selected.size === expected.size;
                const scoreEarned = hasExtraSelection ? 0 : (question.points * correctCount) / expected.size;
                return {
                    isCorrect,
                    scoreEarned,
                    autoGraded: true,
                };
            }
            case ExamQuestionType.FILL_IN: {
                const possible = (question.textAnswers ?? []).map((ans) => ans.trim().toLowerCase());
                const submitted = answer.textAnswer?.trim().toLowerCase();
                const isCorrect = submitted ? possible.includes(submitted) : false;
                return {
                    isCorrect,
                    scoreEarned: isCorrect ? question.points : 0,
                    autoGraded: possible.length > 0,
                };
            }
            default:
                return { isCorrect: false, scoreEarned: 0, autoGraded: false };
        }
    }
}

