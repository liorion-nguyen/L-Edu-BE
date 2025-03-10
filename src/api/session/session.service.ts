import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateSessionRequest, SearchSessionRequest, UpdateSessionRequest } from "src/payload/request/session.request";
import { Session } from "src/scheme/session.schema";
import { CoursesService } from "../courses/courses.service";

@Injectable()
export class SessionService {
    constructor(
        @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
        private readonly coursesService: CoursesService,
    ) { }

    async CreateSession(body: CreateSessionRequest): Promise<Session> {
        const sessionExist = await this.sessionModel.findOne({ $or: [{ title: body.title }, { sessionNumber: body.sessionNumber }] });
        if (sessionExist) {
            throw new Error(`Session with title ${body.title} or session number ${body.sessionNumber} already exist`);
        }
        const session = new this.sessionModel(body);
        const newSession = await session.save();
        await this.coursesService.AddSession(body.courseId, newSession._id.toString());
        return newSession;
    }

    async Search(query: SearchSessionRequest) {
        const { limit = 6, page = 0 } = query;
        const offset = page * limit;
        const filter: any = {};

        if (query.title) {
            filter.name = { $regex: query.title, $options: "i" };
        }

        if (query.numberSession) {
            filter.name = { $regex: query.numberSession, $options: "i" };
        }

        const data = await this.sessionModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .exec();

        const total = await this.sessionModel.countDocuments(filter).exec();

        return {
            data: data,
            total,
        };
    }

    async UpdateSession(id: string, body: UpdateSessionRequest): Promise<Session> {
        if (body.sessionNumber) {
            const sessionExist = await this.sessionModel.findOne({ sessionNumber: body.sessionNumber });
            if (sessionExist) {
                throw new Error(`Session with session number ${body.sessionNumber} already exist`);
            }
        }
        if (body.title) {
            const sessionExist2 = await this.sessionModel.findOne({ title: body.title });
            if (sessionExist2) {
                throw new Error(`Session with title ${body.title} already exist`);
            }
        }
        const Session = await this.sessionModel.findByIdAndUpdate(id, body, { new: true });
        if (!Session) {
            throw new Error(`Session with id ${id} not found`);
        }
        return Session;
    }

    async DeleteSession(id: string): Promise<string> {
        const Session = await this.sessionModel.findByIdAndDelete(id);
        if (!Session) {
            throw new Error(`Session with id ${id} not found`);
        }
        // await this.coursesService.RemoveSession(Session, id);
        return `Delete Session [${Session.title}] success`;
    }
}