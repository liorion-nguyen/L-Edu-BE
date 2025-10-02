import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../../scheme/session.schema';
import { Course, CourseDocument } from '../../scheme/course.schema';
import { CreateSessionDto, UpdateSessionDto, SessionQueryDto, SessionResponseDto, SessionStatsDto } from './dto/session.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class DashboardSessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll(query: SessionQueryDto): Promise<{ sessions: SessionResponseDto[], total: number }> {
    const { page = 1, limit = 10, search, courseId, instructorId, type, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (courseId) filter.courseId = courseId;
    if (instructorId) filter.instructorId = instructorId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Build sort object
    const sort: any = {};
    if (sortBy === 'createdAt') {
      sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'updatedAt') {
      sort.updatedAt = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'title') {
      sort.title = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'order') {
      sort.order = sortOrder === 'asc' ? 1 : -1;
    } else {
      // Default sort
      sort.order = 1;
      sort.createdAt = -1;
    }

    const sessions = await this.sessionModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.sessionModel.countDocuments(filter);

    return {
      sessions: sessions.map(session => this.mapToResponseDto(session)),
      total,
    };
  }

  async findOne(id: string): Promise<SessionResponseDto> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return this.mapToResponseDto(session);
  }

  async create(createSessionDto: CreateSessionDto): Promise<SessionResponseDto> {
    try {
      const session = new this.sessionModel(createSessionDto);
      const savedSession = await session.save();
      return this.mapToResponseDto(savedSession);
    } catch (error) {
      throw new BadRequestException('Failed to create session');
    }
  }

  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<SessionResponseDto> {
    const session = await this.sessionModel.findByIdAndUpdate(
      id,
      updateSessionDto,
      { new: true, runValidators: true }
    ).exec();

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.mapToResponseDto(session);
  }

  async remove(id: string): Promise<void> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Delete thumbnail from Cloudinary if exists
    if (session.thumbnail) {
      try {
        await this.cloudinaryService.deleteFileByUrl(session.thumbnail);
      } catch (error) {
        console.error('Failed to delete thumbnail from Cloudinary:', error);
      }
    }

    await this.sessionModel.findByIdAndDelete(id).exec();
  }

  async getStats(): Promise<SessionStatsDto> {
    const [
      totalSessions,
      publishedSessions,
      draftSessions,
      archivedSessions,
      sessionsWithViews,
      sessionsWithDuration,
      sessionsWithCompletionRate,
    ] = await Promise.all([
      this.sessionModel.countDocuments(),
      this.sessionModel.countDocuments({ status: 'PUBLISHED' }),
      this.sessionModel.countDocuments({ status: 'DRAFT' }),
      this.sessionModel.countDocuments({ status: 'ARCHIVED' }),
      this.sessionModel.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]),
      this.sessionModel.aggregate([
        { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
      ]),
      this.sessionModel.aggregate([
        { $group: { _id: null, avgCompletionRate: { $avg: '$completionRate' } } }
      ]),
    ]);

    return {
      totalSessions,
      publishedSessions,
      draftSessions,
      archivedSessions,
      totalViews: sessionsWithViews[0]?.totalViews || 0,
      averageDuration: Math.round(sessionsWithDuration[0]?.avgDuration || 0),
      averageCompletionRate: Math.round(sessionsWithCompletionRate[0]?.avgCompletionRate || 0),
    };
  }

  async uploadThumbnail(file: Express.Multer.File): Promise<{ url: string }> {
    try {
      const result = await this.cloudinaryService.uploadFile(file);
      return { url: result.secure_url };
    } catch (error) {
      throw new BadRequestException('Failed to upload thumbnail');
    }
  }

  async deleteThumbnail(url: string): Promise<void> {
    try {
      await this.cloudinaryService.deleteFileByUrl(url);
    } catch (error) {
      throw new BadRequestException('Failed to delete thumbnail');
    }
  }

  private mapToResponseDto(session: SessionDocument): SessionResponseDto {
    return {
      _id: session._id.toString(),
      title: session.title,
      courseId: session.courseId,
      sessionNumber: session.sessionNumber.toString(),
      views: session.views,
      description: session.description,
      mode: session.mode,
      videoUrl: session.videoUrl as any,
      quizId: session.quizId as any,
      notesMd: session.notesMd as any,
      createdAt: (session as any).createdAt,
      updatedAt: (session as any).updatedAt,
    };
  }

  async getCourses(): Promise<{courses: Array<{_id: string, title: string}>}> {
    // Get distinct courseIds from sessions
    const sessionCourseIds = await this.sessionModel.distinct('courseId');
    
    // Get course details for those courseIds
    const courses = await this.courseModel.find(
      { _id: { $in: sessionCourseIds } }, 
      '_id name'
    ).exec();
    
    return {
      courses: courses.map(course => ({
        _id: course._id.toString(),
        title: course.name
      }))
    };
  }
}
