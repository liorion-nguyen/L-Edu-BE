import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto } from './dto/review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../enums/user.enum';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req) {
    const review = await this.reviewService.create(createReviewDto, req.user._id);
    return {
      success: true,
      message: 'Review created successfully',
      data: review,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(@Query() query: ReviewQueryDto) {
    const result = await this.reviewService.findAll(query);
    return {
      success: true,
      message: 'Reviews retrieved successfully',
      data: result.reviews,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Get('course/:courseId')
  async findByCourseId(@Param('courseId') courseId: string, @Query() query: ReviewQueryDto) {
    const result = await this.reviewService.findByCourseId(courseId, query);
    return {
      success: true,
      message: 'Course reviews retrieved successfully',
      data: result.reviews,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  async getMyReviews(@Query() query: ReviewQueryDto, @Req() req) {
    const result = await this.reviewService.findByUserId(req.user._id, query);
    return {
      success: true,
      message: 'My reviews retrieved successfully',
      data: result.reviews,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Get('stats')
  async getStats(@Query('courseId') courseId?: string) {
    const stats = await this.reviewService.getStats(courseId);
    return {
      success: true,
      message: 'Review stats retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const review = await this.reviewService.findOne(id);
    return {
      success: true,
      message: 'Review retrieved successfully',
      data: review,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @Req() req) {
    const review = await this.reviewService.update(id, updateReviewDto, req.user._id, req.user.role);
    return {
      success: true,
      message: 'Review updated successfully',
      data: review,
    };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const review = await this.reviewService.updateStatus(id, status);
    return {
      success: true,
      message: 'Review status updated successfully',
      data: review,
    };
  }

  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async toggleVisibility(@Param('id') id: string, @Body('isHidden') isHidden: boolean) {
    const review = await this.reviewService.toggleVisibility(id, isHidden);
    return {
      success: true,
      message: `Review ${isHidden ? 'hidden' : 'shown'} successfully`,
      data: review,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req) {
    await this.reviewService.remove(id, req.user._id, req.user.role);
    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }

}
