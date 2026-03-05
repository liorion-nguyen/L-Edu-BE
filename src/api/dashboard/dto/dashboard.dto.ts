import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DashboardStatsDto {
  @IsNumber()
  totalUsers: number;

  @IsNumber()
  totalCourses: number;

  @IsNumber()
  totalSessions: number;

  @IsNumber()
  totalReviews: number;

  @IsNumber()
  totalConversations: number;

  @IsNumber()
  totalMessages: number;

  @IsNumber()
  @IsOptional()
  userGrowthPercentage?: number;

  @IsNumber()
  @IsOptional()
  courseGrowthPercentage?: number;

  @IsNumber()
  @IsOptional()
  sessionGrowthPercentage?: number;

  @IsNumber()
  @IsOptional()
  reviewGrowthPercentage?: number;

  @IsNumber()
  @IsOptional()
  averageRating?: number;

  @IsNumber()
  @IsOptional()
  activeUsersToday?: number;

  @IsNumber()
  @IsOptional()
  newUsersThisWeek?: number;
}

export class UserGrowthDataDto {
  @IsString()
  date: string;

  @IsNumber()
  count: number;
}

export class CourseEnrollmentDataDto {
  @IsString()
  course: string;

  @IsNumber()
  enrollments: number;
}

export class ChatActivityDataDto {
  @IsString()
  date: string;

  @IsNumber()
  messages: number;

  @IsNumber()
  conversations: number;
}

export class ReviewTrendsDataDto {
  @IsString()
  date: string;

  @IsNumber()
  reviews: number;

  @IsNumber()
  averageRating: number;
}
