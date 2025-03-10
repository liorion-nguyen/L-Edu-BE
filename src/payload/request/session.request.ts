import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Mode } from 'src/enums/session.enum';

export class NotesMd {
    @ApiProperty({ example: 'OPEN', description: 'Mode of the session' })
    @IsEnum(Mode)
    @IsNotEmpty()
    mode: Mode;

    @ApiProperty({ example: '# Markdown Content...', description: 'Markdown content for session notes' })
    @IsEnum(Mode)
    @IsNotEmpty()
    notesMd: string;
}

export class VideoUrl {
    @ApiProperty({ example: 'OPEN', description: 'Mode of the session' })
    @IsEnum(Mode)
    @IsNotEmpty()
    mode: Mode;

    @ApiProperty({ example: 'https://youtube.com/example-video', description: 'URL of the session video' })
    @IsEnum(Mode)
    @IsNotEmpty()
    videoUrl: string;
}


export class QuizId {
    @ApiProperty({ example: '65234b6d1d4a3c001f8a8b50', description: 'Quiz ID linked to this session' })
    @IsString()
    @IsNotEmpty()
    quizId: string;

    @ApiProperty({ example: 'OPEN', description: 'Mode of the session' })
    @IsString()
    @IsNotEmpty()
    mode: Mode;
}

export class CreateSessionRequest {
    @ApiProperty({ example: "65234b6d1d4a3c023h8a8b50", description: 'Course ID' })
    @IsString()
    @IsNotEmpty()
    courseId: string;

    @ApiProperty({ example: 1, description: 'Session number in the course' })
    @IsNumber()
    @IsNotEmpty()
    sessionNumber: number;

    @ApiProperty({ example: 'Introduction to Node.js', description: 'Title of the session' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ example: '65234b6d1d4a3c001f8a8b50', description: 'Quiz ID linked to this session' })
    @IsOptional()
    @Type(() => QuizId)
    quizId?: QuizId;

    @ApiProperty({ example: 'https://youtube.com/example-video', description: 'URL of the session video' })
    @Type(() => VideoUrl)
    @IsOptional()
    videoUrl?: VideoUrl;

    @ApiProperty({ example: '# Markdown Content...', description: 'Markdown content for session notes' })
    @Type(() => NotesMd)
    @IsOptional()
    notesMd?: NotesMd;
}

export class UpdateSessionRequest extends PartialType(CreateSessionRequest) {
    @ApiPropertyOptional({ example: 100, description: 'Number of views' })
    @IsOptional()
    @IsNumber()
    views?: number;
}

export class SearchSessionRequest {
    @ApiProperty({ example: 1, description: "Số trang" })
    @IsString()
    @IsNotEmpty()
    page: number;

    @ApiProperty({ example: 6, description: "Số lượng" })
    @IsString()
    @IsNotEmpty()
    limit: number;

    @ApiPropertyOptional({ example: "Lập trình Node.js", description: "Tên khóa học" })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ example: "1", description: "Buổi học số" })
    @IsOptional()
    @IsString()
    numberSession?: string;
}