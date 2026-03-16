import { IsString, IsOptional, IsEnum, IsArray, IsNumber, MinLength, MaxLength, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ClassStatus } from '../../../scheme/class.schema';
import { AttendanceStatus } from '../../../scheme/attendance.schema';

export class CreateClassDto {
  @IsString()
  @MinLength(1, { message: 'Class name is required' })
  @MaxLength(200)
  name: string;

  @IsString()
  courseId: string;

  @IsOptional()
  @IsString()
  teacherId?: string | null;

  @IsOptional()
  @IsArray()
  studentIds?: string[];

  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;
}

export class ScheduleSlotDto {
  @IsString()
  date: string;

  @IsString()
  timeStart: string;

  @IsString()
  timeEnd: string;

  @IsOptional()
  @IsString()
  teacherId?: string | null;

  @IsOptional()
  @IsString()
  mentorId?: string | null;
}

export class EnrollmentItemDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsDateString()
  enrolledAt?: string;
}

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  teacherId?: string | null;

  @IsOptional()
  @IsArray()
  studentIds?: string[];

  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;

  @IsOptional()
  @IsString()
  scheduleFrequency?: string;

  @IsOptional()
  @IsNumber()
  totalSessions?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleSlotDto)
  scheduleSlots?: ScheduleSlotDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnrollmentItemDto)
  enrollments?: EnrollmentItemDto[];
}

export class ClassQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  search?: string;

  @IsOptional()
  courseId?: string;

  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;
}

export class AttendanceRecordDto {
  @IsString()
  userId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class UpdateAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}

export class StudentCommentItemDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateSessionNoteDto {
  @IsOptional()
  @IsString()
  sessionContent?: string;

  @IsOptional()
  @IsString()
  homework?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentCommentItemDto)
  studentComments?: StudentCommentItemDto[];
}

export interface ClassResponseDto {
  _id: string;
  name: string;
  courseId: string;
  teacherId: string | null;
  studentIds: string[];
  status: ClassStatus;
  scheduleFrequency?: string;
  totalSessions?: number;
  scheduleSlots?: Array<{ date: string; timeStart: string; timeEnd: string; teacherId?: string | null; mentorId?: string | null }>;
  course?: { _id: string; name: string };
  teacher?: { _id: string; fullName: string; email?: string } | null;
  students?: Array<{ _id: string; fullName: string; email?: string }>;
  studentCount?: number;
  enrollments?: Array<{ userId: string; enrolledAt: string }>;
  createdAt?: string;
  updatedAt?: string;
}
