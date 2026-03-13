import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Role } from '../../enums/user.enum';
import { RegistrationStatus } from '../../scheme/course-registration.schema';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CourseRegistrationService } from './course-registration.service';
import { CourseRegistrationResponseDto, CreateCourseRegistrationDto, UpdateCourseRegistrationDto } from './dto/course-registration.dto';

@Controller('dashboard/course-registrations')
@UseGuards(JwtAuthGuard)
export class CourseRegistrationController {
  constructor(private readonly registrationService: CourseRegistrationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT, Role.ADMIN, Role.TEACHER)
  async createRegistration(
    @Req() req: any,
    @Body() createDto: CreateCourseRegistrationDto
  ): Promise<CourseRegistrationResponseDto> {
    return this.registrationService.createRegistration(req.user._id, createDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async getAllRegistrations(): Promise<CourseRegistrationResponseDto[]> {
    return this.registrationService.getAllRegistrations();
  }

  @Get('my-registrations')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT, Role.ADMIN, Role.TEACHER)
  async getMyRegistrations(@Req() req: any): Promise<CourseRegistrationResponseDto[]> {
    return this.registrationService.getRegistrationsByUser(req.user._id);
  }

  @Get('by-status/:status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async getRegistrationsByStatus(@Param('status') status: RegistrationStatus): Promise<CourseRegistrationResponseDto[]> {
    return this.registrationService.getRegistrationsByStatus(status);
  }

  /** Phải đứng trước by-course/:courseId để path "count-by-courses" không bị match nhầm thành courseId */
  @Get('count-by-courses')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async getRegistrationCountByCourseIds(@Query('courseIds') courseIds: string | string[]): Promise<Record<string, number>> {
    const ids = Array.isArray(courseIds) ? courseIds : (typeof courseIds === 'string' ? courseIds.split(',') : []);
    return this.registrationService.getRegistrationCountByCourseIds(ids);
  }

  @Get('pending-count-by-courses')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async getPendingRegistrationCountByCourseIds(@Query('courseIds') courseIds: string | string[]): Promise<Record<string, number>> {
    const ids = Array.isArray(courseIds) ? courseIds : (typeof courseIds === 'string' ? courseIds.split(',') : []);
    return this.registrationService.getPendingRegistrationCountByCourseIds(ids);
  }

  @Get('by-course/:courseId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async getRegistrationsByCourse(@Param('courseId') courseId: string): Promise<CourseRegistrationResponseDto[]> {
    return this.registrationService.getRegistrationsByCourse(courseId);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async updateRegistrationStatus(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateDto: UpdateCourseRegistrationDto
  ): Promise<CourseRegistrationResponseDto> {
    return this.registrationService.updateRegistrationStatus(id, updateDto, req.user._id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async deleteRegistration(@Param('id') id: string): Promise<{ message: string }> {
    await this.registrationService.deleteRegistration(id);
    return { message: 'Đơn đăng ký đã được xóa thành công' };
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async getRegistrationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    return this.registrationService.getRegistrationStats();
  }
}
