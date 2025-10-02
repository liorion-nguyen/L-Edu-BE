import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DashboardSessionService } from './session.service';
import { CreateSessionDto, UpdateSessionDto, SessionQueryDto, SessionResponseDto, SessionStatsDto } from './dto/session.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../enums/user.enum';

@Controller('dashboard/sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionController {
  constructor(private readonly sessionService: DashboardSessionService) {}

  @Get()
  @Roles(Role.ADMIN, Role.STUDENT, Role.TEACHER)
  async findAll(@Query() query: SessionQueryDto): Promise<{ sessions: SessionResponseDto[], total: number }> {
    return this.sessionService.findAll(query);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  async getStats(): Promise<SessionStatsDto> {
    return this.sessionService.getStats();
  }

  @Get('courses')
  @Roles(Role.ADMIN, Role.STUDENT, Role.TEACHER)
  async getCourses(): Promise<{courses: Array<{_id: string, title: string}>}> {
    return this.sessionService.getCourses();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STUDENT, Role.TEACHER)
  async findOne(@Param('id') id: string): Promise<SessionResponseDto> {
    return this.sessionService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createSessionDto: CreateSessionDto): Promise<SessionResponseDto> {
    return this.sessionService.create(createSessionDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto): Promise<SessionResponseDto> {
    return this.sessionService.update(id, updateSessionDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.sessionService.remove(id);
    return { message: 'Session deleted successfully' };
  }

  @Post('upload/thumbnail')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadThumbnail(@UploadedFile() file: Express.Multer.File): Promise<{ data: { url: string } }> {
    const result = await this.sessionService.uploadThumbnail(file);
    return { data: result };
  }

  @Delete('delete/thumbnail')
  @Roles(Role.ADMIN)
  async deleteThumbnail(@Body('url') url: string): Promise<{ message: string }> {
    await this.sessionService.deleteThumbnail(url);
    return { message: 'Thumbnail deleted successfully' };
  }
}
