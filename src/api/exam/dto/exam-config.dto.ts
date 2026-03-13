import { Type } from "class-transformer";
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from "class-validator";
import { ExamQuestionType } from "src/scheme/exam.schema";

export class ExamOptionDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @MaxLength(2000)
    text: string;

    @IsOptional()
    @IsBoolean()
    isCorrect?: boolean;
}

export class ExamQuestionDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsEnum(ExamQuestionType)
    type: ExamQuestionType;

    @IsString()
    @MaxLength(10000)
    content: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    media?: string[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExamOptionDto)
    options?: ExamOptionDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    correctAnswers?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    textAnswers?: string[];

    @IsOptional()
    @IsString()
    explanation?: string;

    @IsNumber()
    @IsPositive()
    points: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    order?: number;
}

export class ExamConfigDto {
    @IsNumber()
    @IsPositive()
    durationMinutes: number;

    @IsOptional()
    @IsDateString()
    startTime?: string;

    @IsOptional()
    @IsDateString()
    endTime?: string;

    @IsOptional()
    @IsBoolean()
    shuffleQuestions?: boolean;

    @IsOptional()
    @IsBoolean()
    shuffleOptions?: boolean;

    @IsOptional()
    @IsBoolean()
    allowBacktrack?: boolean;

    @IsOptional()
    @IsBoolean()
    autoSubmit?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    passingScore?: number;
}

export class CreateExamDto {
    @IsString()
    @MaxLength(255)
    title: string;

    @IsOptional()
    @IsString()
    @MaxLength(5000)
    description?: string;

    @IsString()
    courseId: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sessionIds?: string[];

    @IsString()
    instructorId: string;

    @ValidateNested()
    @Type(() => ExamConfigDto)
    config: ExamConfigDto;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(200)
    @ValidateNested({ each: true })
    @Type(() => ExamQuestionDto)
    questions: ExamQuestionDto[];
}

export class UpdateExamDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(5000)
    description?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sessionIds?: string[];

    @IsOptional()
    @ValidateNested()
    @Type(() => ExamConfigDto)
    config?: ExamConfigDto;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(200)
    @ValidateNested({ each: true })
    @Type(() => ExamQuestionDto)
    questions?: ExamQuestionDto[];
}

