import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class, ClassDocument } from '../../scheme/class.schema';
import { Attendance, AttendanceDocument } from '../../scheme/attendance.schema';
import { SessionNote, SessionNoteDocument } from '../../scheme/session-note.schema';
import { Session, SessionDocument } from '../../scheme/session.schema';
import { Course, CourseDocument } from '../../scheme/course.schema';
import {
  CreateClassDto,
  UpdateClassDto,
  ClassQueryDto,
  ClassResponseDto,
  UpdateAttendanceDto,
  UpdateSessionNoteDto,
} from './dto/class.dto';
import { ClassStatus } from '../../scheme/class.schema';
import { AttendanceStatus } from '../../scheme/attendance.schema';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(SessionNote.name) private sessionNoteModel: Model<SessionNoteDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async findAll(query: ClassQueryDto): Promise<{ classes: ClassResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, courseId, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (courseId) {
      filter.courseId = new Types.ObjectId(courseId);
    }
    if (status) {
      filter.status = status;
    }

    const classes = await this.classModel
      .find(filter)
      .populate('courseId', 'name')
      .populate('teacherId', 'fullName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    const total = await this.classModel.countDocuments(filter).exec();

    const result: ClassResponseDto[] = await Promise.all(
      classes.map(async (c: any) => {
        const studentCount = Array.isArray(c.studentIds) ? c.studentIds.length : 0;
        return {
          _id: c._id.toString(),
          name: c.name,
          courseId: c.courseId?._id?.toString() ?? c.courseId?.toString?.() ?? '',
          teacherId: c.teacherId?._id?.toString() ?? c.teacherId ?? null,
          studentIds: (c.studentIds || []).map((id: any) => (typeof id === 'object' && id?._id ? id._id.toString() : id?.toString?.() ?? id)),
          status: c.status || ClassStatus.ACTIVE,
          course: c.courseId ? { _id: c.courseId._id?.toString(), name: c.courseId.name } : undefined,
          teacher: c.teacherId ? { _id: c.teacherId._id?.toString(), fullName: c.teacherId.fullName, email: c.teacherId.email } : null,
          studentCount,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        };
      }),
    );

    return { classes: result, total, page: Number(page), limit: Number(limit) };
  }

  async findOne(id: string): Promise<ClassResponseDto> {
    const c = await this.classModel
      .findById(id)
      .populate('courseId', 'name')
      .populate('teacherId', 'fullName email avatar')
      .populate('studentIds', 'fullName email avatar')
      .exec();
    if (!c) {
      throw new NotFoundException('Class not found');
    }
    const doc = c.toObject ? c.toObject() : c;
    return {
      _id: doc._id.toString(),
      name: doc.name,
      courseId: (doc.courseId as any)?._id?.toString() ?? doc.courseId?.toString?.() ?? '',
      teacherId: (doc.teacherId as any)?._id?.toString() ?? doc.teacherId ?? null,
      studentIds: (doc.studentIds || []).map((s: any) => (s?._id ? s._id.toString() : s?.toString?.() ?? s)),
      status: doc.status || ClassStatus.ACTIVE,
      course: doc.courseId ? { _id: (doc.courseId as any)._id?.toString(), name: (doc.courseId as any).name } : undefined,
      teacher: doc.teacherId
        ? {
            _id: (doc.teacherId as any)._id?.toString(),
            fullName: (doc.teacherId as any).fullName,
            email: (doc.teacherId as any).email,
          }
        : null,
      students: (doc.studentIds || []).map((s: any) => ({
        _id: s._id?.toString(),
        fullName: s.fullName,
        email: s.email,
      })),
      studentCount: (doc.studentIds || []).length,
      scheduleFrequency: (doc as any).scheduleFrequency,
      totalSessions: (doc as any).totalSessions,
      scheduleSlots: (doc as any).scheduleSlots || [],
      enrollments: ((doc as any).enrollments || []).map((e: any) => ({
        userId: (e.userId as any)?.toString?.() ?? e.userId,
        enrolledAt: (e.enrolledAt && new Date(e.enrolledAt).toISOString) || new Date().toISOString(),
      })),
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }

  async create(dto: CreateClassDto): Promise<ClassResponseDto> {
    const course = await this.courseModel.findById(dto.courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    const studentIds = dto.studentIds ?? [];
    const enrollments = studentIds.map((userId: string) => ({
      userId,
      enrolledAt: new Date(),
    }));
    const created = new this.classModel({
      name: dto.name,
      courseId: dto.courseId,
      teacherId: dto.teacherId ?? null,
      studentIds,
      status: dto.status ?? ClassStatus.ACTIVE,
      enrollments,
    });
    const saved = await created.save();

    // Auto-enroll class students into the linked course
    if (studentIds.length > 0) {
      await this.courseModel.updateOne(
        { _id: dto.courseId },
        { $addToSet: { students: { $each: studentIds.map((id) => new Types.ObjectId(id)) } } },
      ).exec();
    }
    return this.findOne(saved._id.toString());
  }

  async update(id: string, dto: UpdateClassDto): Promise<ClassResponseDto> {
    const before = await this.classModel.findById(id).lean().exec();
    if (!before) {
      throw new NotFoundException('Class not found');
    }
    const update: any = {
      ...(dto.name != null && { name: dto.name }),
      ...(dto.teacherId !== undefined && { teacherId: dto.teacherId }),
      ...(dto.studentIds !== undefined && { studentIds: dto.studentIds }),
      ...(dto.status != null && { status: dto.status }),
    };
    // Keep enrollments consistent with studentIds when updating roster
    if (dto.studentIds !== undefined) {
      update.enrollments = (dto.studentIds || []).map((userId: string) => ({
        userId,
        enrolledAt: new Date(),
      }));
    }
    if (dto.scheduleFrequency !== undefined) update.scheduleFrequency = dto.scheduleFrequency;
    if (dto.totalSessions !== undefined) update.totalSessions = dto.totalSessions;
    if (dto.scheduleSlots !== undefined) update.scheduleSlots = dto.scheduleSlots;
    const c = await this.classModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!c) throw new NotFoundException('Class not found');

    // Auto-enroll any (new) class students into the linked course
    if (dto.studentIds !== undefined) {
      const courseId = (before as any).courseId?.toString?.() ?? (before as any).courseId;
      const ids = (dto.studentIds || []).filter(Boolean);
      if (courseId && ids.length > 0) {
        await this.courseModel.updateOne(
          { _id: courseId },
          { $addToSet: { students: { $each: ids.map((sid) => new Types.ObjectId(sid)) } } },
        ).exec();
      }
    }

    return this.findOne(c._id.toString());
  }

  async remove(id: string): Promise<void> {
    const c = await this.classModel.findByIdAndDelete(id).exec();
    if (!c) {
      throw new NotFoundException('Class not found');
    }
    await this.attendanceModel.deleteMany({ classId: id }).exec();
  }

  async getSessionsForClass(classId: string): Promise<{ _id: string; title: string; sessionNumber: number; order: number }[]> {
    const cls = await this.classModel.findById(classId).exec();
    if (!cls) {
      throw new NotFoundException('Class not found');
    }
    const sessions = await this.sessionModel
      .find({ courseId: cls.courseId.toString() })
      .sort({ order: 1, sessionNumber: 1 })
      .lean()
      .exec();
    return sessions.map((s: any) => ({
      _id: s._id.toString(),
      title: s.title,
      sessionNumber: s.sessionNumber ?? 0,
      order: s.order ?? 0,
    }));
  }

  async getAttendance(classId: string, sessionId: string): Promise<{ records: { userId: string; status: string }[] }> {
    const cls = await this.classModel.findById(classId).exec();
    if (!cls) {
      throw new NotFoundException('Class not found');
    }
    let att = await this.attendanceModel.findOne({ classId, sessionId }).lean().exec();
    if (!att) {
      return { records: [] };
    }
    return {
      records: (att.records || []).map((r: any) => ({
        userId: r.userId?.toString?.() ?? r.userId,
        status: r.status || AttendanceStatus.NOT_MARKED,
      })),
    };
  }

  async updateAttendance(classId: string, sessionId: string, dto: UpdateAttendanceDto): Promise<{ records: { userId: string; status: string }[] }> {
    const cls = await this.classModel.findById(classId).exec();
    if (!cls) {
      throw new NotFoundException('Class not found');
    }
    const session = await this.sessionModel.findById(sessionId).exec();
    if (!session || session.courseId.toString() !== cls.courseId.toString()) {
      throw new NotFoundException('Session not found or does not belong to this class course');
    }
    const records = (dto.records || []).map((r) => ({ userId: r.userId, status: r.status }));
    const att = await this.attendanceModel.findOneAndUpdate(
      { classId, sessionId },
      { $set: { records } },
      { new: true, upsert: true },
    ).lean().exec();
    return {
      records: (att?.records || []).map((r: any) => ({
        userId: r.userId?.toString?.() ?? r.userId,
        status: r.status || AttendanceStatus.NOT_MARKED,
      })),
    };
  }

  async getAttendances(classId: string): Promise<{ sessionId: string; records: { userId: string; status: string }[] }[]> {
    const cls = await this.classModel.findById(classId).exec();
    if (!cls) {
      throw new NotFoundException('Class not found');
    }
    const list = await this.attendanceModel.find({ classId }).lean().exec();
    return list.map((a: any) => ({
      sessionId: a.sessionId?.toString?.() ?? a.sessionId,
      records: (a.records || []).map((r: any) => ({
        userId: r.userId?.toString?.() ?? r.userId,
        status: r.status || AttendanceStatus.NOT_MARKED,
      })),
    }));
  }

  async getSessionNote(classId: string, sessionId: string): Promise<{ sessionContent: string; homework: string; studentComments: { userId: string; comment: string }[] }> {
    const cls = await this.classModel.findById(classId).exec();
    if (!cls) throw new NotFoundException('Class not found');
    const note = await this.sessionNoteModel.findOne({ classId, sessionId }).lean().exec();
    if (!note) {
      return { sessionContent: '', homework: '', studentComments: [] };
    }
    return {
      sessionContent: (note as any).sessionContent ?? '',
      homework: (note as any).homework ?? '',
      studentComments: ((note as any).studentComments || []).map((c: any) => ({
        userId: (c.userId as any)?.toString?.() ?? c.userId,
        comment: c.comment ?? '',
      })),
    };
  }

  async findMyClasses(userId: string): Promise<ClassResponseDto[]> {
    const uid = typeof userId === 'string' ? userId : (userId as any)?.toString?.();
    const objectId = new Types.ObjectId(uid);
    const classes = await this.classModel
      .find({
        $or: [{ studentIds: objectId }, { 'enrollments.userId': objectId }],
      })
      .populate('courseId', 'name')
      .populate('teacherId', 'fullName email')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return classes.map((c: any) => ({
      _id: c._id.toString(),
      name: c.name,
      courseId: c.courseId?._id?.toString() ?? c.courseId?.toString?.() ?? '',
      teacherId: c.teacherId?._id?.toString() ?? c.teacherId ?? null,
      studentIds: (c.studentIds || []).map((id: any) => (typeof id === 'object' && id?._id ? id._id.toString() : id?.toString?.() ?? id)),
      status: c.status || ClassStatus.ACTIVE,
      course: c.courseId ? { _id: c.courseId._id?.toString(), name: c.courseId.name } : undefined,
      teacher: c.teacherId ? { _id: c.teacherId._id?.toString(), fullName: c.teacherId.fullName, email: c.teacherId.email } : null,
      scheduleFrequency: (c as any).scheduleFrequency,
      totalSessions: (c as any).totalSessions,
      scheduleSlots: (c as any).scheduleSlots || [],
      createdAt: (c as any).createdAt,
      updatedAt: (c as any).updatedAt,
    }));
  }

  async ensureStudentMember(classId: string, userId: string): Promise<void> {
    const c = await this.classModel.findById(classId).lean().exec();
    if (!c) {
      throw new NotFoundException('Class not found');
    }
    const uid = typeof userId === 'string' ? userId : (userId as any)?.toString?.() ?? '';
    const studentIds = (c.studentIds || []).map((id: any) => (typeof id === 'object' && id?._id ? id._id.toString() : id?.toString?.() ?? id));
    const enrollmentUserIds = ((c as any).enrollments || []).map((e: any) => (e.userId && typeof e.userId === 'object' ? (e.userId as any).toString() : e.userId?.toString?.() ?? e.userId));
    const isInStudentIds = studentIds.some((id) => id === uid);
    const isInEnrollments = enrollmentUserIds.some((id) => id === uid);
    if (!isInStudentIds && !isInEnrollments) {
      throw new ForbiddenException('You are not a member of this class');
    }
  }

  async getMyAttendances(classId: string, userId: string): Promise<{ sessionId: string; status: string }[]> {
    await this.ensureStudentMember(classId, userId);
    const list = await this.attendanceModel.find({ classId }).lean().exec();
    return list.map((a: any) => {
      const record = (a.records || []).find((r: any) => (r.userId?.toString?.() ?? r.userId) === userId);
      return {
        sessionId: a.sessionId?.toString?.() ?? a.sessionId,
        status: record?.status ?? AttendanceStatus.NOT_MARKED,
      };
    });
  }

  async getSessionNoteForStudent(classId: string, sessionId: string, userId: string): Promise<{ sessionContent: string; homework: string; studentComments: { userId: string; comment: string }[] }> {
    await this.ensureStudentMember(classId, userId);
    const full = await this.getSessionNote(classId, sessionId);
    const uid = typeof userId === 'string' ? userId : (userId as any)?.toString?.() ?? '';
    const myComment = full.studentComments.find((c) => String(c.userId) === String(uid));
    return {
      sessionContent: full.sessionContent,
      homework: full.homework,
      studentComments: myComment ? [myComment] : [],
    };
  }

  async getMySchedule(
    userId: string,
    range?: { from?: string; to?: string },
  ): Promise<
    Array<{
      classId: string;
      className: string;
      courseId?: string;
      courseName?: string;
      start: string;
      end: string;
      platform?: string;
    }>
  > {
    const classes = await this.findMyClasses(userId);
    const fromDate = range?.from ? new Date(range.from) : null;
    const toDate = range?.to ? new Date(range.to) : null;
    const now = new Date();

    const events: Array<{
      classId: string;
      className: string;
      courseId?: string;
      courseName?: string;
      start: string;
      end: string;
      platform?: string;
    }> = [];

    for (const c of classes) {
      const slots = (c.scheduleSlots || []) as any[];
      for (const s of slots) {
        if (!s?.date || !s?.timeStart) continue;
        const start = new Date(`${s.date}T${s.timeStart}:00`);
        const end = new Date(`${s.date}T${(s.timeEnd || s.timeStart)}:00`);
        if (Number.isNaN(start.getTime())) continue;
        if (start.getTime() < now.getTime() - 1000 * 60 * 60 * 24) continue; // keep recent past out
        if (fromDate && start.getTime() < fromDate.getTime()) continue;
        if (toDate && start.getTime() > toDate.getTime()) continue;
        events.push({
          classId: c._id,
          className: c.name,
          courseId: c.course?._id || c.courseId,
          courseName: c.course?.name,
          start: start.toISOString(),
          end: Number.isNaN(end.getTime()) ? start.toISOString() : end.toISOString(),
          platform: 'Zoom',
        });
      }
    }

    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return events;
  }

  async updateSessionNote(classId: string, sessionId: string, dto: UpdateSessionNoteDto): Promise<{ sessionContent: string; homework: string; studentComments: { userId: string; comment: string }[] }> {
    const cls = await this.classModel.findById(classId).exec();
    if (!cls) throw new NotFoundException('Class not found');
    const att = await this.attendanceModel.findOne({ classId, sessionId }).lean().exec();
    const presentOrLateUserIds = new Set<string>();
    (att?.records || []).forEach((r: any) => {
      const uid = (r.userId as any)?.toString?.() ?? r.userId;
      const status = r.status;
      if (status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE) {
        presentOrLateUserIds.add(uid);
      }
    });
    const incomingComments = dto.studentComments || [];
    const allowedComments =
      presentOrLateUserIds.size > 0
        ? incomingComments.filter((c) => presentOrLateUserIds.has(c.userId))
        : incomingComments;
    const payload = {
      sessionContent: dto.sessionContent ?? '',
      homework: dto.homework ?? '',
      studentComments: allowedComments.map((c) => ({ userId: c.userId, comment: c.comment ?? '' })),
    };
    const updated = await this.sessionNoteModel.findOneAndUpdate(
      { classId, sessionId },
      payload,
      { new: true, upsert: true },
    ).lean().exec();
    return {
      sessionContent: (updated as any)?.sessionContent ?? '',
      homework: (updated as any)?.homework ?? '',
      studentComments: ((updated as any)?.studentComments || []).map((c: any) => ({
        userId: (c.userId as any)?.toString?.() ?? c.userId,
        comment: c.comment ?? '',
      })),
    };
  }
}
