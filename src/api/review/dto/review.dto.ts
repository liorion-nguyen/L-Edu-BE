import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, Min, Max, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReviewDto {
  @IsString()
  courseId: string;

  @IsNumber()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;

  @IsString()
  @MinLength(1, { message: 'Comment is required' })
  @MaxLength(1000, { message: 'Comment must be less than 1000 characters' })
  comment: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating?: number;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Comment is required' })
  @MaxLength(1000, { message: 'Comment must be less than 1000 characters' })
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;
}

export class ReviewQueryDto {
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
  courseId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}

export class ReviewResponseDto {
  _id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string;
  status: string;
  isAnonymous: boolean;
  isHidden: boolean;
  editCount: number;
  lastEditedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  course?: {
    _id: string;
    name: string;
  };
}

export class ReviewStatsDto {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  approvedReviews: number;
  pendingReviews: number;
  rejectedReviews: number;
}
