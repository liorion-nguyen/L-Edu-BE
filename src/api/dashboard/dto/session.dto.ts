import { IsString, IsOptional, IsEnum, IsNumber, MinLength, MaxLength, IsArray, IsUrl, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';
import { SessionStatus, SessionType } from '../../../scheme/session.schema';

export class CreateSessionDto {
  @IsString()
  @MinLength(1, { message: 'Session title is required' })
  @MaxLength(200, { message: 'Session title must be less than 200 characters' })
  title: string;

  @IsString()
  courseId: string;

  @Transform(({ value }) => typeof value === 'string' ? parseInt(value) : value)
  @IsNumber({}, { message: 'Session number must be a number' })
  sessionNumber: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  instructorId?: string; // Add instructorId field

  @IsOptional()
  videoUrl?: {
    videoUrl?: string;
    mode?: string;
  };

  @IsOptional()
  quizId?: {
    quizId?: string;
    mode?: string;
  };

  @IsOptional()
  notesMd?: {
    notesMd?: any;
    mode?: string;
  };
}

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Session title is required' })
  @MaxLength(200, { message: 'Session title must be less than 200 characters' })
  title?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? parseInt(value) : value)
  @IsNumber({}, { message: 'Session number must be a number' })
  sessionNumber?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  videoUrl?: {
    videoUrl?: string;
    mode?: string;
  };

  @IsOptional()
  quizId?: {
    quizId?: string;
    mode?: string;
  };

  @IsOptional()
  notesMd?: {
    notesMd?: any;
    mode?: string;
  };
}

export class SessionQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string; // Search by title or description

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  instructorId?: string;

  @IsOptional()
  @IsEnum(SessionType)
  type?: SessionType;

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'; // Sort by field

  @IsOptional()
  @IsString()
  sortOrder?: string = 'desc'; // 'asc' or 'desc'
}

export class SessionResponseDto {
  _id: string;
  title: string;
  courseId: string;
  sessionNumber: number; // Changed from string to number
  views: number;
  description?: string;
  mode?: string;
  videoUrl?: {
    videoUrl?: string;
    mode?: string;
  };
  quizId?: {
    quizId?: string;
    mode?: string;
  };
  notesMd?: {
    notesMd?: any;
    mode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class SessionStatsDto {
  totalSessions: number;
  publishedSessions: number;
  draftSessions: number;
  archivedSessions: number;
  totalViews: number;
  averageDuration: number;
  averageCompletionRate: number;
}
