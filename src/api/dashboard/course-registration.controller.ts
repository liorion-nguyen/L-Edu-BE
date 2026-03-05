import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Req
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../enums/user.enum';
import { CourseRegistrationService } from './course-registration.service';
import { CreateCourseRegistrationDto, UpdateCourseRegistrationDto, CourseRegistrationResponseDto } from './dto/course-registration.dto';
import { RegistrationStatus } from '../../scheme/course-registration.schema';

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
