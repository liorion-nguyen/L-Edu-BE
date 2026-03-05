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
  HttpStatus,
  HttpException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CourseService } from './course.service';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto, AddStudentToCourseDto, RemoveStudentFromCourseDto, UpdateCourseInstructorDto } from './dto/course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../enums/user.enum';

@Controller('dashboard/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @Roles(Role.ADMIN, Role.STUDENT, Role.TEACHER)
  async findAll(@Query() query: CourseQueryDto) {
    const { courses, total, page, limit } = await this.courseService.findAll(query);
    return {
      success: true,
      message: 'Courses fetched successfully',
      data: courses,
      pagination: { total, page, limit },
    };
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  async getStats() {
    const stats = await this.courseService.getStats();
    return {
      success: true,
      message: 'Course stats fetched successfully',
      data: stats,
    };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STUDENT, Role.TEACHER)
  async findOne(@Param('id') id: string) {
    const course = await this.courseService.findOne(id);
    return { success: true, message: 'Course fetched successfully', data: course };
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createCourseDto: CreateCourseDto) {
    const course = await this.courseService.create(createCourseDto);
    return { success: true, message: 'Course created successfully', data: course };
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    const course = await this.courseService.update(id, updateCourseDto);
    return { success: true, message: 'Course updated successfully', data: course };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    const course = await this.courseService.remove(id);
    return { success: true, message: 'Course deleted successfully', data: course };
  }

  @Post('upload/thumbnail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadThumbnail(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const thumbnailUrl = await this.courseService.uploadThumbnail(file);
      return {
        success: true,
        message: 'Thumbnail uploaded successfully',
        data: { url: thumbnailUrl }
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('upload/icon')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadIcon(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const iconUrl = await this.courseService.uploadIcon(file);
      return {
        success: true,
        message: 'Icon uploaded successfully',
        data: { url: iconUrl }
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async addStudentToCourse(@Param('id') courseId: string, @Body() addStudentDto: AddStudentToCourseDto) {
    try {
      const course = await this.courseService.addStudentToCourse(courseId, addStudentDto.studentId);
      return {
        success: true,
        message: 'Student added to course successfully',
        data: course
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id/students/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async removeStudentFromCourse(@Param('id') courseId: string, @Param('studentId') studentId: string) {
    try {
      const course = await this.courseService.removeStudentFromCourse(courseId, studentId);
      return {
        success: true,
        message: 'Student removed from course successfully',
        data: course
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/instructor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateCourseInstructor(@Param('id') courseId: string, @Body() updateInstructorDto: UpdateCourseInstructorDto) {
    try {
      const course = await this.courseService.updateCourseInstructor(courseId, updateInstructorDto.instructorId || null);
      return {
        success: true,
        message: updateInstructorDto.instructorId ? 'Course instructor updated successfully' : 'Course instructor removed successfully',
        data: course
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id/instructor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async removeCourseInstructor(@Param('id') courseId: string) {
    try {
      const course = await this.courseService.updateCourseInstructor(courseId, null);
      return {
        success: true,
        message: 'Course instructor removed successfully',
        data: course
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('available/instructors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAvailableInstructors() {
    try {
      const instructors = await this.courseService.getAvailableInstructors();
      return {
        success: true,
        message: 'Available instructors retrieved successfully',
        data: instructors
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('available/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAvailableStudents() {
    try {
      const students = await this.courseService.getAvailableStudents();
      return {
        success: true,
        message: 'Available students retrieved successfully',
        data: students
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getCourseStudents(@Param('id') courseId: string) {
    try {
      const students = await this.courseService.getCourseStudents(courseId);
      return {
        success: true,
        message: 'Course students retrieved successfully',
        data: students
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/instructor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getCourseInstructor(@Param('id') courseId: string) {
    try {
      const instructor = await this.courseService.getCourseInstructor(courseId);
      return {
        success: true,
        message: 'Course instructor retrieved successfully',
        data: instructor
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
