import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../enums/user.enum';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getDashboardStats();
  }

  @Get('stats/user-growth')
  @Roles(Role.ADMIN)
  async getUserGrowthData(): Promise<{ date: string; count: number }[]> {
    return this.dashboardService.getUserGrowthData();
  }

  @Get('stats/course-enrollment')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getCourseEnrollmentData(): Promise<{ course: string; enrollments: number }[]> {
    return this.dashboardService.getCourseEnrollmentData();
  }

  @Get('stats/chat-activity')
  @Roles(Role.ADMIN)
  async getChatActivityData(): Promise<{ date: string; messages: number; conversations: number }[]> {
    return this.dashboardService.getChatActivityData();
  }

  @Get('stats/review-trends')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getReviewTrendsData(): Promise<{ date: string; reviews: number; averageRating: number }[]> {
    return this.dashboardService.getReviewTrendsData();
  }

  @Get('recent-activities')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getRecentActivities(): Promise<any[]> {
    return this.dashboardService.getRecentActivities();
  }

  @Get('debug-activities')
  @Roles(Role.ADMIN)
  async debugActivities(): Promise<any> {
    return this.dashboardService.debugActivities();
  }
}
