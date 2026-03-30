import { Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto, UpdateClassDto, ClassQueryDto, UpdateAttendanceDto, UpdateSessionNoteDto } from './dto/class.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../enums/user.enum';

@Controller('dashboard/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  async findAll(@Query() query: ClassQueryDto) {
    const { classes, total, page, limit } = await this.classService.findAll(query);
    return {
      success: true,
      message: 'Classes fetched successfully',
      data: classes,
      pagination: { total, page, limit },
    };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async findOne(@Param('id') id: string) {
    const cls = await this.classService.findOne(id);
    return { success: true, message: 'Class fetched successfully', data: cls };
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createClassDto: CreateClassDto) {
    const cls = await this.classService.create(createClassDto);
    return { success: true, message: 'Class created successfully', data: cls };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    const cls = await this.classService.update(id, updateClassDto);
    return { success: true, message: 'Class updated successfully', data: cls };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.classService.remove(id);
    return { success: true, message: 'Class deleted successfully' };
  }

  @Get(':id/sessions')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getSessions(@Param('id') id: string) {
    const sessions = await this.classService.getSessionsForClass(id);
    return { success: true, message: 'Sessions fetched successfully', data: sessions };
  }

  @Get(':id/attendances')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getAttendances(@Param('id') id: string) {
    const attendances = await this.classService.getAttendances(id);
    return { success: true, message: 'Attendances fetched successfully', data: attendances };
  }

  @Get(':id/attendances/:sessionId')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getAttendance(@Param('id') id: string, @Param('sessionId') sessionId: string) {
    const att = await this.classService.getAttendance(id, sessionId);
    return { success: true, message: 'Attendance fetched successfully', data: att };
  }

  @Put(':id/attendances/:sessionId')
  @Roles(Role.ADMIN, Role.TEACHER)
  async updateAttendance(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    const att = await this.classService.updateAttendance(id, sessionId, dto);
    return { success: true, message: 'Attendance updated successfully', data: att };
  }

  @Get(':id/notes/:sessionId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async getSessionNote(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Req() req: { user: { _id?: string; role: string } },
  ) {
    if (req.user.role === Role.STUDENT) {
      // Student can only view notes for classes they belong to
      const studentId = (req.user as any)?._id?.toString?.() ?? (req.user as any)?._id ?? '';
      await this.classService.ensureStudentMember(id, studentId);
      const note = await this.classService.getSessionNoteForStudent(id, sessionId, studentId);
      return { success: true, message: 'Session note fetched successfully', data: note };
    }
    const note = await this.classService.getSessionNote(id, sessionId);
    return { success: true, message: 'Session note fetched successfully', data: note };
  }

  @Put(':id/notes/:sessionId')
  @Roles(Role.ADMIN, Role.TEACHER)
  async updateSessionNote(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateSessionNoteDto,
  ) {
    const note = await this.classService.updateSessionNote(id, sessionId, dto);
    return { success: true, message: 'Session note updated successfully', data: note };
  }
}
