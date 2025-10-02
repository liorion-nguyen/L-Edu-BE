import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../../scheme/course.schema';
import { User, UserDocument } from '../../scheme/user.schema';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto, CourseResponseDto, CourseStatsDto, AddStudentToCourseDto, RemoveStudentFromCourseDto, UpdateCourseInstructorDto } from './dto/course.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll(query: CourseQueryDto): Promise<{ courses: CourseResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, category, categoryId, status } = query;
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      filter.category = category;
    }
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    if (status) {
      filter.status = status;
    }

    const courses = await this.courseModel
      .find(filter)
      .populate('instructorId', 'fullName email avatar')
      .populate('students', 'fullName email avatar')
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.courseModel.countDocuments(filter).exec();

    return { 
      courses: courses.map(course => this.mapToResponseDto(course)), 
      total, 
      page, 
      limit 
    };
  }

  async findOne(id: string): Promise<CourseResponseDto> {
    const course = await this.courseModel
      .findById(id)
      .populate('instructorId', 'fullName email avatar')
      .populate('students', 'fullName email avatar')
      .exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return this.mapToResponseDto(course);
  }

  async create(createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    const existingCourse = await this.courseModel.findOne({ name: createCourseDto.name }).exec();
    if (existingCourse) {
      throw new ConflictException('Course with this name already exists');
    }

    const createdCourse = new this.courseModel(createCourseDto);
    const savedCourse = await createdCourse.save();
    return this.mapToResponseDto(savedCourse);
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<CourseResponseDto> {
    const course = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .populate('instructorId', 'fullName email avatar')
      .populate('students', 'fullName email avatar')
      .exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return this.mapToResponseDto(course);
  }

  async remove(id: string): Promise<CourseResponseDto> {
    const course = await this.courseModel.findByIdAndDelete(id).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return this.mapToResponseDto(course);
  }

  async addStudentToCourse(courseId: string, studentId: string): Promise<CourseResponseDto> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if student exists
    const student = await this.userModel.findById(studentId).exec();
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    console.log('Before adding - students:', course.students);
    console.log('Adding studentId:', studentId);

    // Check if student is already enrolled
    if (course.students.some(id => id.toString() === studentId)) {
      throw new ConflictException('Student is already enrolled in this course');
    }

    // Add student to course
    course.students.push(studentId);
    console.log('After adding - students:', course.students);
    
    await course.save();
    console.log('Course saved successfully');

    // Return updated course with populated data
    return this.findOne(courseId);
  }

  async removeStudentFromCourse(courseId: string, studentId: string): Promise<CourseResponseDto> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    console.log('Before removal - students:', course.students);
    console.log('Removing studentId:', studentId);

    // Check if student is enrolled
    if (!course.students.includes(studentId)) {
      throw new NotFoundException('Student is not enrolled in this course');
    }

    // Remove student from course
    course.students = course.students.filter(id => id.toString() !== studentId);
    console.log('After removal - students:', course.students);
    
    await course.save();
    console.log('Course saved successfully');

    // Return updated course with populated data
    return this.findOne(courseId);
  }

  async updateCourseInstructor(courseId: string, instructorId: string): Promise<CourseResponseDto> {
    // Check if instructor exists
    const instructor = await this.userModel.findById(instructorId).exec();
    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    const course = await this.courseModel.findByIdAndUpdate(
      courseId, 
      { instructorId }, 
      { new: true }
    ).exec();
    
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Return updated course with populated data
    return this.findOne(courseId);
  }

  async getAvailableInstructors(): Promise<any[]> {
    return this.userModel.find({ role: 'INSTRUCTOR' }).select('_id fullName email avatar').exec();
  }

  async getAvailableStudents(): Promise<any[]> {
    return this.userModel.find({ role: 'STUDENT' }).select('_id fullName email avatar').exec();
  }

  async getCourseStudents(courseId: string): Promise<any[]> {
    const course = await this.courseModel.findById(courseId).populate('students', 'fullName email avatar').exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course.students as any[];
  }

  async getCourseInstructor(courseId: string): Promise<any> {
    const course = await this.courseModel.findById(courseId).populate('instructorId', 'fullName email avatar').exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course.instructorId;
  }

  async getStats(): Promise<CourseStatsDto> {
    const totalCourses = await this.courseModel.countDocuments().exec();
    const activeCourses = await this.courseModel.countDocuments({ status: 'ACTIVE' }).exec();
    const inactiveCourses = await this.courseModel.countDocuments({ status: 'INACTIVE' }).exec();
    
    const courses = await this.courseModel.find().exec();
    const totalStudents = courses.reduce((sum, course) => sum + course.students.length, 0);
    const averagePrice = courses.length > 0 ? courses.reduce((sum, course) => sum + course.price, 0) / courses.length : 0;

    return {
      totalCourses,
      activeCourses,
      inactiveCourses,
      totalStudents,
      averagePrice: Math.round(averagePrice * 100) / 100,
    };
  }

  private mapToResponseDto(course: CourseDocument): CourseResponseDto {
    return {
      _id: course._id.toString(),
      name: course.name,
      description: course.description,
      price: course.price,
      instructorId: course.instructorId,
      instructor: (course as any).instructorId, // This is populated data
      category: course.category,
      categoryId: course.categoryId,
      cover: course.cover,
      icon: course.icon,
      students: course.students, // Array of ObjectIds
      studentDetails: (course as any).students, // This is populated data
      sessions: course.sessions,
      duration: course.duration,
      status: course.status,
      averageRating: course.averageRating || 0,
      totalReviews: course.totalReviews || 0,
      createdAt: (course as any).createdAt,
      updatedAt: (course as any).updatedAt,
    };
  }

  async uploadThumbnail(file: Express.Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadFile(file);
      return result.secure_url;
    } catch (error) {
      throw new Error(`Failed to upload thumbnail: ${error.message}`);
    }
  }

  async uploadIcon(file: Express.Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadFile(file);
      return result.secure_url;
    } catch (error) {
      throw new Error(`Failed to upload icon: ${error.message}`);
    }
  }

  async deleteThumbnail(url: string): Promise<void> {
    try {
      await this.cloudinaryService.deleteFileByUrl(url);
    } catch (error) {
      console.error(`Failed to delete thumbnail: ${error.message}`);
    }
  }

  async deleteIcon(url: string): Promise<void> {
    try {
      await this.cloudinaryService.deleteFileByUrl(url);
    } catch (error) {
      console.error(`Failed to delete icon: ${error.message}`);
    }
  }
}
