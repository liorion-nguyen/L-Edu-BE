import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { CreateCourseRequest, SearchCourseRequest, UpdateCourseRequest } from "src/payload/request/courses.request";
import { CourseResponse, MyCourseResponse } from "src/payload/response/courses.response";
import { Course } from "src/scheme/course.schema";
import { UserService } from "../users/users.service";
import { SessionService } from "../session/session.service";
import { UserCoreResponse } from "src/payload/response/users.response";
import { User } from "src/scheme/user.schema";
import { Role } from "src/enums/user.enum";
import { Mode } from "src/enums/session.enum";
import { Status } from "src/enums/course.enum";

@Injectable()
export class CoursesService {
    constructor(
        @InjectModel(Course.name) private readonly courseModel: Model<Course>,
        private readonly userService: UserService,
        private readonly sessionService: SessionService,
    ) { }

    async Search(query: SearchCourseRequest, user?: { _id: string; role: string }): Promise<{ data: CourseResponse[]; total: number }> {
        const limit = Number(query.limit) || 6;
        const page = Number(query.page) || 0;
        const offset = page * limit;

        const filter: Record<string, unknown> = {
            status: Status.ACTIVE,
        };

        if (query.name) {
            filter.name = { $regex: query.name, $options: "i" };
        }

        if (query.categoryId) {
            // countDocuments/find cast string → ObjectId; aggregate $match does NOT — must cast or total vs rows mismatch
            try {
                filter.categoryId = new Types.ObjectId(query.categoryId);
            } catch {
                filter.categoryId = query.categoryId;
            }
        }

        const total = await this.courseModel.countDocuments(filter).exec();

        const viewerId =
            user?._id != null ? new Types.ObjectId(String(user._id)) : null;

        const pipeline: PipelineStage[] = [{ $match: filter }];

        if (viewerId) {
            pipeline.push({
                $addFields: {
                    _isJoined: {
                        $cond: [
                            {
                                $in: [
                                    viewerId,
                                    { $ifNull: ["$students", []] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            });
            pipeline.push({
                $sort: { _isJoined: -1, createdAt: -1 },
            });
        } else {
            pipeline.push({ $sort: { createdAt: -1 } });
        }

        pipeline.push({ $skip: offset }, { $limit: limit });
        pipeline.push({ $project: { _id: 1 } });

        const idRows = await this.courseModel.aggregate(pipeline).exec();
        const ids = idRows.map((r) => r._id as Types.ObjectId);

        if (ids.length === 0) {
            return { data: [], total };
        }

        const data = await this.courseModel
            .find({ _id: { $in: ids } })
            .populate("instructorId", "fullName avatar")
            .lean()
            .exec();

        const orderMap = new Map(ids.map((id, i) => [id.toString(), i]));
        data.sort(
            (a, b) =>
                (orderMap.get(String(a._id)) ?? 0) -
                (orderMap.get(String(b._id)) ?? 0),
        );

        const coursesWithInstructor: CourseResponse[] = data.map((course) => {
            let mode = Mode.OPEN;
            const populated = course.instructorId as any;
            const instructor: UserCoreResponse | null = populated
                ? {
                      _id: populated._id?.toString(),
                      fullName: populated.fullName,
                      avatar: populated.avatar,
                  }
                : null;

            if (user && user.role !== Role.ADMIN) {
                const isStudentEnrolled = (course.students || []).some(
                    (studentId: any) =>
                        studentId.toString() === user._id.toString(),
                );
                if (!isStudentEnrolled) {
                    mode = Mode.CLOSE;
                }
            } else if (!user) {
                mode = Mode.CLOSE;
            }

            return {
                ...course,
                _id: course._id.toString(),
                instructor,
                mode,
            };
        });

        return {
            data: coursesWithInstructor,
            total,
        };
    }

    async MyCourse(user): Promise<MyCourseResponse[]> {
        let courses = [];

        const coursesTeacher = await this.courseModel.find({ instructorId: user._id })
        .populate('instructorId', '_id fullName avatar');
        if (coursesTeacher) {
            courses = coursesTeacher.map((course) => ({
                _id: course._id.toString(),
                name: course.name,
                instructor: course.instructorId,
                duration: course.duration,
                numberOfSessionCurrent: course.sessions.length,
                role: Role.TEACHER,
            }));   
        }
        const coursesStudent = await this.courseModel.find({ students: { $in: [user._id] } })
        .populate('instructorId', '_id fullName avatar');
        if (coursesStudent) {
            courses = courses.concat(coursesStudent.map((course) => ({
                _id: course._id.toString(),
                name: course.name,
                instructor: course.instructorId,
                duration: course.duration,
                numberOfSessionCurrent: course.sessions.length,
                role: Role.STUDENT,
            })));
        }

        return courses;
    }


    async CreateCourse(body: CreateCourseRequest): Promise<Course> {
        const courseExist = await this.courseModel.findOne({ name: body.name });
        if (courseExist) {
            throw new Error(`Course with name ${body.name} already exist`);
        }
        const course = new this.courseModel(body);
        return course.save();
    }

    async UpdateCourse(id: string, updateData: UpdateCourseRequest): Promise<Course> {
        const course = await this.courseModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!course) {
            throw new Error(`Course with id ${id} not found`);
        }
        return course;
    }

    async DeleteCourse(id: string): Promise<string> {
        const course = await this.courseModel.findByIdAndDelete(id);
        if (!course) {
            throw new Error(`Course with id ${id} not found`);
        }
        return `Delete course [${course.name}] success`;
    }

    async AddSession(courseId: string, sessionId: string): Promise<void> {
        const course = await this.courseModel.findByIdAndUpdate(courseId, { $push: { sessions: sessionId } }, { new: true });
        if (!course) {
            throw new Error(`Course with id ${courseId} not found`);
        }
    }

    async RemoveSession(_id: string, sessionId: string): Promise<void> {
        const course = await this.courseModel.findByIdAndUpdate(_id, { $pull: { sessions: sessionId } }, { new: true });
        if (!course) {
            throw new Error(`Course with id ${_id} not found`);
        }
    }

    async GetCourse(_id: string, user?: { _id: string; role: string }): Promise<CourseResponse> {
        const course = await this.courseModel.findById(_id);
        if (!course) {
            throw new Error(`Course with id ${_id} not found`);
        }
        const role = user?.role ?? Role.STUDENT;

        const [instructor, sessions] = await Promise.all([
            course.instructorId ? this.userService.getUserCore(course.instructorId) : Promise.resolve(null),
            course.sessions.length > 0 ? this.sessionService.getSessionsCore(_id, role) : Promise.resolve([]),
        ]);

        return {
            _id: course._id.toString(),
            name: course.name,
            description: course.description,
            price: course.price,
            discount: course.discount ?? undefined,
            instructor,
            cover: course.cover ?? undefined,
            students: course.students || [],
            sessions,
            duration: course.duration,
            status: course.status,
            instructorId: course.instructorId,
        };
    }

}