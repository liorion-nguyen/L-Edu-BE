import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../enums/user.enum';
import { ClassService } from '../dashboard/class.service';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN)
export class ClassesController {
  constructor(private readonly classService: ClassService) {}

  @Get('my-schedule')
  async getMySchedule(
    @Req() req: { user: { _id: string } },
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const events = await this.classService.getMySchedule(req.user._id, { from, to });
    return { success: true, message: 'My schedule fetched successfully', data: events };
  }

  @Get('my-classes')
  async getMyClasses(@Req() req: { user: { _id: string } }) {
    const classes = await this.classService.findMyClasses(req.user._id);
    return { success: true, message: 'My classes fetched successfully', data: classes };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user: { _id: string; role: string } }) {
    if (req.user.role === Role.STUDENT) {
      await this.classService.ensureStudentMember(id, req.user._id);
    }
    const cls = await this.classService.findOne(id);
    return { success: true, message: 'Class fetched successfully', data: cls };
  }

  @Get(':id/sessions')
  async getSessions(@Param('id') id: string, @Req() req: { user: { _id: string; role: string } }) {
    if (req.user.role === Role.STUDENT) {
      await this.classService.ensureStudentMember(id, req.user._id);
    }
    const sessions = await this.classService.getSessionsForClass(id);
    return { success: true, message: 'Sessions fetched successfully', data: sessions };
  }

  @Get(':id/my-attendances')
  async getMyAttendances(
    @Param('id') id: string,
    @Req() req: { user: { _id: string; role: string } },
  ) {
    // This endpoint is primarily for student-facing "my attendance" views.
    // Admin/Teacher should not be blocked with 403 when browsing user-site pages.
    if (req.user.role !== Role.STUDENT) {
      return { success: true, message: 'My attendances fetched successfully', data: [] };
    }
    const attendances = await this.classService.getMyAttendances(id, req.user._id);
    return { success: true, message: 'My attendances fetched successfully', data: attendances };
  }

  @Get(':id/notes/:sessionId')
  async getSessionNote(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Req() req: { user: { _id: string; role: string } },
  ) {
    if (req.user.role === Role.STUDENT) {
      const note = await this.classService.getSessionNoteForStudent(id, sessionId, req.user._id);
      return { success: true, message: 'Session note fetched successfully', data: note };
    }
    const note = await this.classService.getSessionNote(id, sessionId);
    return { success: true, message: 'Session note fetched successfully', data: note };
  }
}
