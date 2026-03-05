import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from "mongoose";

export enum ExamVisibility {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
}

export enum ExamQuestionType {
    SINGLE = "SINGLE",
    MULTIPLE = "MULTIPLE",
    FILL_IN = "FILL_IN",
}

export enum ExamAttemptStatus {
    IN_PROGRESS = "IN_PROGRESS",
    SUBMITTED = "SUBMITTED",
    GRADED = "GRADED",
    AUTO_SUBMITTED = "AUTO_SUBMITTED",
}

@Schema({ _id: false })
export class ExamConfig {
    @Prop({ type: Number, required: true })
    durationMinutes: number;

    @Prop({ type: Date })
    startTime?: Date;

    @Prop({ type: Date })
    endTime?: Date;

    @Prop({ type: Boolean, default: false })
    shuffleQuestions?: boolean;

    @Prop({ type: Boolean, default: false })
    shuffleOptions?: boolean;

    @Prop({ type: Boolean, default: true })
    allowBacktrack?: boolean;

    @Prop({ type: Boolean, default: true })
    autoSubmit?: boolean;

    @Prop({ type: Number, default: 0 })
    passingScore?: number;
}

@Schema({ _id: false })
export class ExamOption {
    @Prop({ type: String, required: true })
    id: string;

    @Prop({ type: String, required: true })
    text: string;

    @Prop({ type: Boolean, default: false })
    isCorrect?: boolean;
}

@Schema({ _id: false })
export class ExamQuestion {
    @Prop({ type: String, default: () => new Types.ObjectId().toHexString() })
    id: string;

    @Prop({ type: String, enum: ExamQuestionType, required: true })
    type: ExamQuestionType;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: [String], default: [] })
    media?: string[];

    @Prop({ type: [ExamOption], default: [] })
    options?: ExamOption[];

    @Prop({ type: [String], default: [] })
    correctAnswers?: string[];

    @Prop({ type: [String], default: [] })
    textAnswers?: string[];

    @Prop({ type: String })
    explanation?: string;

    @Prop({ type: Number, required: true })
    points: number;

    @Prop({ type: [String], default: [] })
    tags?: string[];

    @Prop({ type: Number, default: 0 })
    order?: number;
}

@Schema({ timestamps: true })
export class Exam extends Document {
    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Course", required: true })
    courseId: string;

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: "Session", default: [] })
    sessionIds: string[];

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
    instructorId: string;

    @Prop({ type: ExamConfig, required: true })
    config: ExamConfig;

    @Prop({ type: [ExamQuestion], default: [] })
    questions: ExamQuestion[];

    @Prop({ type: Number, default: 0 })
    totalPoints: number;

    @Prop({ type: String, enum: ExamVisibility, default: ExamVisibility.DRAFT })
    visibility: ExamVisibility;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
export type ExamDocument = Exam & Document;

@Schema({ _id: false })
export class AttemptAnswer {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
    questionId: string;

    @Prop({ type: [String], default: [] })
    selectedOptionIds?: string[];

    @Prop({ type: String })
    textAnswer?: string;

    @Prop({ type: Boolean })
    isCorrect?: boolean;

    @Prop({ type: Number, default: 0 })
    scoreEarned?: number;

    @Prop({ type: Boolean, default: true })
    autoGraded?: boolean;
}

@Schema({ timestamps: true })
export class ExamAttempt extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Exam", required: true })
    examId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
    studentId: string;

    @Prop({ type: Date, required: true })
    startedAt: Date;

    @Prop({ type: Date })
    submittedAt?: Date;

    @Prop({ type: String, enum: ExamAttemptStatus, default: ExamAttemptStatus.IN_PROGRESS })
    status: ExamAttemptStatus;

    @Prop({ type: Number, default: 0 })
    totalScore?: number;

    @Prop({ type: Number, default: 0 })
    maxScore?: number;

    @Prop({ type: [AttemptAnswer], default: [] })
    answers: AttemptAnswer[];

    @Prop({ type: Object, default: {} })
    deviceInfo?: Record<string, any>;
}

export const ExamAttemptSchema = SchemaFactory.createForClass(ExamAttempt);
export type ExamAttemptDocument = ExamAttempt & Document;

@Schema({ timestamps: true })
export class QuestionBank extends Document {
    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Course" })
    courseId?: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
    createdBy: string;

    @Prop({ type: [ExamQuestion], default: [] })
    questions: ExamQuestion[];
}

export const QuestionBankSchema = SchemaFactory.createForClass(QuestionBank);
export type QuestionBankDocument = QuestionBank & Document;

