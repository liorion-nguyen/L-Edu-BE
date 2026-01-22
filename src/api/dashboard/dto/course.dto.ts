import { IsString, IsOptional, IsEnum, IsNumber, MinLength, MaxLength, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { Status } from '../../../enums/course.enum';

export class CreateCourseDto {
  @IsString()
  @MinLength(1, { message: 'Course name is required' })
  @MaxLength(100, { message: 'Course name must be less than 100 characters' })
  name: string;

  @IsString()
  @MinLength(1, { message: 'Description is required' })
  @MaxLength(10000, { message: 'Description must be less than 10000 characters' })
  description: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  instructorId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsArray()
  students?: string[];

  @IsOptional()
  @IsArray()
  sessions?: string[];

  @IsNumber()
  duration: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Course name is required' })
  @MaxLength(100, { message: 'Course name must be less than 100 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Description is required' })
  @MaxLength(10000, { message: 'Description must be less than 10000 characters' })
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  instructorId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsArray()
  students?: string[];

  @IsOptional()
  @IsArray()
  sessions?: string[];

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

export class CourseQueryDto {
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
  search?: string; // Search by name or description

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

export class CourseResponseDto {
  _id: string;
  name: string;
  description: string;
  price: number;
  instructorId?: string;
  instructor?: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  category?: string;
  categoryId?: string;
  cover?: string;
  icon?: string;
  students: string[];
  studentDetails?: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  }[];
  sessions: string[];
  duration: number;
  status: Status;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CourseStatsDto {
  totalCourses: number;
  activeCourses: number;
  inactiveCourses: number;
  totalStudents: number;
  averagePrice: number;
}

export class AddStudentToCourseDto {
  @IsString()
  studentId: string;
}

export class RemoveStudentFromCourseDto {
  @IsString()
  studentId: string;
}

export class UpdateCourseInstructorDto {
  @IsString()
  @IsOptional()
  instructorId?: string | null;
}
