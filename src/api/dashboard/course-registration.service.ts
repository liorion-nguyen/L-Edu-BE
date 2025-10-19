import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseRegistration, CourseRegistrationDocument, RegistrationStatus } from '../../scheme/course-registration.schema';
import { Course, CourseDocument } from '../../scheme/course.schema';
import { User, UserDocument } from '../../scheme/user.schema';
import { CreateCourseRegistrationDto, UpdateCourseRegistrationDto, CourseRegistrationResponseDto } from './dto/course-registration.dto';

@Injectable()
export class CourseRegistrationService {
  constructor(
    @InjectModel(CourseRegistration.name) private registrationModel: Model<CourseRegistrationDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createRegistration(userId: string, createDto: CreateCourseRegistrationDto): Promise<CourseRegistrationResponseDto> {
    // Kiểm tra khóa học có tồn tại không
    const course = await this.courseModel.findById(createDto.courseId);
    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại');
    }

    // Kiểm tra user đã đăng ký khóa học này chưa
    const existingRegistration = await this.registrationModel.findOne({
      userId,
      courseId: createDto.courseId
    });

    if (existingRegistration) {
      throw new BadRequestException('Bạn đã đăng ký khóa học này rồi');
    }

    // Kiểm tra user đã trong danh sách students chưa
    if (course.students && course.students.includes(userId)) {
      throw new BadRequestException('Bạn đã tham gia khóa học này rồi');
    }

    const registration = new this.registrationModel({
      userId,
      courseId: createDto.courseId,
      status: RegistrationStatus.PENDING,
      message: createDto.message
    });

    const savedRegistration = await registration.save();
    return this.mapToResponseDto(savedRegistration);
  }

  async getAllRegistrations(): Promise<CourseRegistrationResponseDto[]> {
    const registrations = await this.registrationModel
      .find()
      .populate({
        path: 'userId',
        select: 'fullName email avatar'
      })
      .populate({
        path: 'courseId',
        select: 'name description cover'
      })
      .sort({ createdAt: -1 })
      .exec();

    console.log('getAllRegistrations - Raw registrations:', JSON.stringify(registrations, null, 2));
    const mappedRegistrations = registrations.map(reg => this.mapToResponseDto(reg));
    console.log('getAllRegistrations - Mapped registrations:', JSON.stringify(mappedRegistrations, null, 2));
    
    return mappedRegistrations;
  }

  async getRegistrationsByUser(userId: string): Promise<CourseRegistrationResponseDto[]> {
    const registrations = await this.registrationModel
      .find({ userId })
      .populate('courseId', 'title description thumbnail')
      .sort({ createdAt: -1 })
      .exec();

    return registrations.map(reg => this.mapToResponseDto(reg));
  }

  async getRegistrationsByStatus(status: RegistrationStatus): Promise<CourseRegistrationResponseDto[]> {
    const registrations = await this.registrationModel
      .find({ status })
      .populate('userId', 'fullName email avatar')
      .populate('courseId', 'title description thumbnail')
      .sort({ createdAt: -1 })
      .exec();

    return registrations.map(reg => this.mapToResponseDto(reg));
  }

  async updateRegistrationStatus(
    registrationId: string, 
    updateDto: UpdateCourseRegistrationDto, 
    adminId: string
  ): Promise<CourseRegistrationResponseDto> {
    const registration = await this.registrationModel.findById(registrationId);
    if (!registration) {
      throw new NotFoundException('Đơn đăng ký không tồn tại');
    }

    // Cập nhật status và thêm user vào khóa học nếu được duyệt
    if (updateDto.status === RegistrationStatus.APPROVED) {
      await this.courseModel.findByIdAndUpdate(
        registration.courseId,
        { $addToSet: { students: registration.userId } }
      );
    }

    registration.status = updateDto.status;
    registration.adminNote = updateDto.adminNote;
    registration.processedBy = adminId;
    registration.processedAt = new Date();

    const updatedRegistration = await registration.save();
    return this.mapToResponseDto(updatedRegistration);
  }

  async deleteRegistration(registrationId: string): Promise<void> {
    const result = await this.registrationModel.findByIdAndDelete(registrationId);
    if (!result) {
      throw new NotFoundException('Đơn đăng ký không tồn tại');
    }
  }

  async getRegistrationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const [total, pending, approved, rejected] = await Promise.all([
      this.registrationModel.countDocuments(),
      this.registrationModel.countDocuments({ status: RegistrationStatus.PENDING }),
      this.registrationModel.countDocuments({ status: RegistrationStatus.APPROVED }),
      this.registrationModel.countDocuments({ status: RegistrationStatus.REJECTED })
    ]);

    return { total, pending, approved, rejected };
  }

  private mapToResponseDto(registration: CourseRegistrationDocument): CourseRegistrationResponseDto {
    return {
      _id: registration._id.toString(),
      userId: registration.userId,
      courseId: registration.courseId,
      status: registration.status,
      message: registration.message,
      adminNote: registration.adminNote,
      processedBy: registration.processedBy,
      processedAt: registration.processedAt,
      createdAt: (registration as any).createdAt,
      updatedAt: (registration as any).updatedAt,
      user: registration.userId && typeof registration.userId === 'object' ? {
        _id: (registration.userId as any)._id,
        fullName: (registration.userId as any).fullName,
        email: (registration.userId as any).email,
        avatar: (registration.userId as any).avatar
      } : undefined,
      course: registration.courseId && typeof registration.courseId === 'object' ? {
        _id: (registration.courseId as any)._id,
        title: (registration.courseId as any).name,
        description: (registration.courseId as any).description,
        thumbnail: (registration.courseId as any).cover
      } : undefined
    };
  }
}
