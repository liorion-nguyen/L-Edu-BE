import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from '../../scheme/review.schema';
import { User, UserDocument } from '../../scheme/user.schema';
import { Course, CourseDocument } from '../../scheme/course.schema';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewQueryDto,
  ReviewResponseDto,
  ReviewStatsDto,
} from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  private mapToResponseDto(review: ReviewDocument): ReviewResponseDto {
    return {
      _id: review._id.toString(),
      userId: review.userId,
      courseId: review.courseId,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      isAnonymous: review.isAnonymous,
      isHidden: review.isHidden,
      createdAt: (review as any).createdAt,
      updatedAt: (review as any).updatedAt,
      user: (review as any).user,
      course: (review as any).course,
    };
  }

  async create(createReviewDto: CreateReviewDto, userId: string): Promise<ReviewResponseDto> {
    // Check if course exists
    const course = await this.courseModel.findById(createReviewDto.courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if user already reviewed this course
    const existingReview = await this.reviewModel.findOne({
      userId,
      courseId: createReviewDto.courseId,
    }).exec();

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this course');
    }

    const review = new this.reviewModel({
      ...createReviewDto,
      userId,
    });

    const savedReview = await review.save();
    await this.updateCourseRating(createReviewDto.courseId);

    return this.mapToResponseDto(savedReview);
  }

  async findAll(query: ReviewQueryDto): Promise<{ reviews: ReviewResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, courseId, userId, status, rating } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (courseId) filter.courseId = courseId;
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (rating) filter.rating = rating;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .populate('userId', 'fullName avatar')
        .populate('courseId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);

    return {
      reviews: reviews.map(review => this.mapToResponseDto(review)),
      total,
      page,
      limit,
    };
  }

  async findByCourseId(courseId: string, query: ReviewQueryDto): Promise<{ reviews: ReviewResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, userId, status, rating } = query;
    const skip = (page - 1) * limit;

    const filter: any = { courseId, isHidden: false }; // Only show non-hidden reviews
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (rating) filter.rating = rating;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .populate('userId', 'fullName avatar')
        .populate('courseId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);

    return {
      reviews: reviews.map(review => this.mapToResponseDto(review)),
      total,
      page,
      limit,
    };
  }

  async findByUserId(userId: string, query: ReviewQueryDto): Promise<{ reviews: ReviewResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, courseId, status, rating } = query;
    const skip = (page - 1) * limit;

    const filter: any = { userId }; // Show all user's reviews (including hidden ones for the user themselves)
    if (courseId) filter.courseId = courseId;
    if (status) filter.status = status;
    if (rating) filter.rating = rating;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .populate('userId', 'fullName avatar')
        .populate('courseId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);

    return {
      reviews: reviews.map(review => this.mapToResponseDto(review)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ReviewResponseDto> {
    const review = await this.reviewModel
      .findById(id)
      .populate('userId', 'fullName avatar')
      .populate('courseId', 'name')
      .exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.mapToResponseDto(review);
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string, userRole: string): Promise<ReviewResponseDto> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only allow user to update their own review, or admin to update any review
    if (review.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(id, updateReviewDto, { new: true })
      .populate('userId', 'fullName avatar')
      .populate('courseId', 'name')
      .exec();

    if (updateReviewDto.rating) {
      await this.updateCourseRating(review.courseId);
    }

    return this.mapToResponseDto(updatedReview);
  }

  async updateStatus(id: string, status: string): Promise<ReviewResponseDto> {
    const review = await this.reviewModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('userId', 'fullName avatar')
      .populate('courseId', 'name')
      .exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.mapToResponseDto(review);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only allow user to delete their own review, or admin to delete any review
    if (review.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewModel.findByIdAndDelete(id).exec();
    await this.updateCourseRating(review.courseId);
  }

  async getStats(courseId?: string): Promise<ReviewStatsDto> {
    const filter = courseId ? { courseId, status: 'APPROVED' } : { status: 'APPROVED' };

    const [totalReviews, approvedReviews, pendingReviews, rejectedReviews, ratingStats] = await Promise.all([
      this.reviewModel.countDocuments(filter).exec(),
      this.reviewModel.countDocuments({ ...filter, status: 'APPROVED' }).exec(),
      this.reviewModel.countDocuments({ ...filter, status: 'PENDING' }).exec(),
      this.reviewModel.countDocuments({ ...filter, status: 'REJECTED' }).exec(),
      this.reviewModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
      ]).exec(),
    ]);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    ratingStats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
      totalRating += stat._id * stat.count;
    });

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      approvedReviews,
      pendingReviews,
      rejectedReviews,
    };
  }

  async toggleVisibility(id: string, isHidden: boolean): Promise<ReviewResponseDto> {
    const review = await this.reviewModel
      .findByIdAndUpdate(id, { isHidden }, { new: true })
      .populate('userId', 'fullName avatar')
      .populate('courseId', 'name')
      .exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.mapToResponseDto(review);
  }

  private async updateCourseRating(courseId: string): Promise<void> {
    const stats = await this.getStats(courseId);
    
    // Update course with new rating stats
    await this.courseModel.findByIdAndUpdate(courseId, {
      $set: {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
      },
    }).exec();
  }
}
