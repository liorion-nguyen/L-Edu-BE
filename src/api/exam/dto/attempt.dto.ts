import { Type } from "class-transformer";
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";
import { ExamAttemptStatus } from "src/scheme/exam.schema";

export class AttemptAnswerDto {
    @IsString()
    @IsNotEmpty()
    questionId: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    selectedOptionIds?: string[];

    @IsOptional()
    @IsString()
    textAnswer?: string;
}

export class CreateAttemptDto {
    @IsString()
    studentId: string;

    @IsOptional()
    @IsObject()
    deviceInfo?: Record<string, any>;
}

export class SaveAttemptProgressDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttemptAnswerDto)
    answers: AttemptAnswerDto[];

    @IsOptional()
    @IsObject()
    deviceInfo?: Record<string, any>;
}

export class SubmitAttemptDto {
    @IsOptional()
    @IsBoolean()
    forceSubmit?: boolean;

    @IsOptional()
    @IsEnum(ExamAttemptStatus)
    status?: ExamAttemptStatus;
}

