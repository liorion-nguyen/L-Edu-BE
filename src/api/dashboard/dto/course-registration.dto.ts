import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { RegistrationStatus } from '../../../scheme/course-registration.schema';

export class CreateCourseRegistrationDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateCourseRegistrationDto {
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;
}

export class CourseRegistrationResponseDto {
  _id: string;
  userId: string;
  courseId: string;
  status: RegistrationStatus;
  message?: string;
  adminNote?: string;
  processedBy?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  user?: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  
  course?: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
  };
}
