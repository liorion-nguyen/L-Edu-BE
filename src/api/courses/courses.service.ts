import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateCourseRequest, SearchCourseRequest, UpdateCourseRequest } from "src/payload/request/courses.request";
import { Course } from "src/scheme/course.schema";

@Injectable()
export class CoursesService {
    constructor(
        @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    ) { }

    async Search(query: SearchCourseRequest) {
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
            .exec();

        const total = await this.courseModel.countDocuments(filter).exec();

        return {
            data: data,
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

    async RemoveSession(courseId: string, sessionId: string): Promise<void> {
        const course = await this.courseModel.findByIdAndUpdate(courseId, { $pull: { sessions: sessionId } }, { new: true });
        if (!course) {
            throw new Error(`Course with id ${courseId} not found`);
        }
    }
}