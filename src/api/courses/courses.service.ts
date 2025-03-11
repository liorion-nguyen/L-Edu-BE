import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateCourseRequest, SearchCourseRequest, UpdateCourseRequest } from "src/payload/request/courses.request";
import { CourseResponse } from "src/payload/response/courses.response";
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

    async Search(query: SearchCourseRequest, user): Promise<{ data: CourseResponse[]; total: number }> {
        const { limit = 6, page = 0 } = query;
        const offset = page * limit;
        const filter: any = {};
    
        if (query.name) {
            filter.name = { $regex: query.name, $options: "i" };
        }
    
        const data = await this.courseModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean()
            .exec();
    
        const total = await this.courseModel.countDocuments(filter).exec();
    
        const coursesWithInstructor: CourseResponse[] = await Promise.all(
            data.map(async (course) => {
                if (course.status != Status.ACTIVE) {
                    return;
                }
                let mode = Mode.OPEN;
                let instructor: UserCoreResponse | null = null;
    
                if (course.instructorId) {
                    try {
                        instructor = await this.userService.getUserCore(course.instructorId);
                    } catch (error) {
                        console.error(`Lỗi lấy instructor cho course ${course._id}:`, error);
                    }
                }
    
                if (user.role !== Role.ADMIN) {
                    const isStudentEnrolled = course.students.some((studentId: string) => studentId == user._id);
                    if (!isStudentEnrolled) {
                        mode = Mode.CLOSE;
                    }
                }
    
                return {
                    ...course,
                    _id: course._id.toString(),
                    instructor,
                    mode
                };
            })
        );
    
        coursesWithInstructor.sort((a, b) => (a.mode === Mode.OPEN ? -1 : 1));
    
        return {
            data: coursesWithInstructor,
            total,
        };
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

    async GetCourse(_id: string, role: string): Promise<CourseResponse> {
        const course = await this.courseModel.findById(_id);
        if (!course) {
            throw new Error(`Course with id ${_id} not found`);
        }

        if (role !== Role.ADMIN) {
            const isStudentEnrolled = course.students.some((studentId: string) => studentId == _id);
            if (!isStudentEnrolled) {
                throw new Error(`Student with id ${_id} is not enrolled in this course`);
            }
        }

        const instructor = course.instructorId
            ? await this.userService.getUserCore(course.instructorId)
            : null;

        const sessions = course.sessions.length > 0
            ? await this.sessionService.getSessionsCore(_id, role) : [];

            
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
            status: course.status
        };
    }

}