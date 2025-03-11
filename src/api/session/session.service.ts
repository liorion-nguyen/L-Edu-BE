import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateSessionRequest, SearchSessionRequest, UpdateSessionRequest } from "src/payload/request/session.request";
import { Session } from "src/scheme/session.schema";
import { CoursesService } from "../courses/courses.service";
import { SessionCoreResponse } from "src/payload/response/session.response";
import { Role } from "src/enums/user.enum";
import { Mode } from "src/enums/session.enum";

@Injectable()
export class SessionService {
    constructor(
        @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
        @Inject(forwardRef(() => CoursesService)) private coursesService: CoursesService
    ) { }

    async CreateSession(body: CreateSessionRequest): Promise<Session> {
        const sessionExist = await this.sessionModel.findOne({ $or: [{ title: body.title }, { $and: [{sessionNumber: body.sessionNumber}, {courseId: body.courseId}] }] });
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
            const sessionExist = await this.sessionModel.findOne({
                $or: [
                    { sessionNumber: body.sessionNumber, courseId: body.courseId },
                    { title: body.title, courseId: body.courseId }
                ],
                _id: { $ne: id }  
            });
            if (sessionExist) {
                throw new BadRequestException(`Session với số ${body.sessionNumber} hoặc tiêu đề "${body.title}" đã tồn tại.`);
            }
        }
        const updatedSession = await this.sessionModel.findByIdAndUpdate(id, body, { new: true });
    
        if (!updatedSession) {
            throw new NotFoundException(`Không tìm thấy session với id: ${id}`);
        }

        return updatedSession;
    }

    async DeleteSession(id: string): Promise<string> {
        const Session = await this.sessionModel.findByIdAndDelete(id);
        if (!Session) {
            throw new Error(`Session with id ${id} not found`);
        }
        await this.coursesService.RemoveSession(Session.courseId, id);
        return `Delete Session [${Session.title}] success`;
    }

    async getSessionsCore(courseId: string, role: string): Promise<SessionCoreResponse[]> {
        try {
            const sessions = await this.sessionModel.find({ courseId }).lean();
            if (!sessions || sessions.length === 0) {
                throw new NotFoundException(`No sessions found for courseId: ${courseId}`);
            }
            return sessions.map(({ _id, sessionNumber, title, views, notesMd, videoUrl, quizId, mode }) => ({
                _id,
                sessionNumber: Number(sessionNumber),
                title,
                views: Number(views),
                modeNoteMd: notesMd ? notesMd?.mode : "CLOSE",
                modeVideoUrl: videoUrl ? videoUrl?.mode : "CLOSE",
                modeQuizId: quizId ? quizId?.mode : "CLOSE",
                mode: role == Role.ADMIN ? Mode.OPEN : mode ?? "CLOSE"
            })) as SessionCoreResponse[];

        } catch (error) {
            throw new Error(`Failed to fetch sessions: ${error.message}`);
        }
    }

    async getSessionById(sessionId: string, role: string): Promise<Session> {
        const session = await this.sessionModel.findById(sessionId);
        if (!session) {
            throw new NotFoundException(`Session with id ${sessionId} not found`);
        }
        if (session.mode != Mode.OPEN && role != Role.ADMIN) {
            throw new BadRequestException(`Session with id ${sessionId} is closed`);
        }
        await this.sessionModel.findByIdAndUpdate(sessionId, { views: session.views + 1 }, { new: true });
        if (role == Role.ADMIN) {
            return {
                ...session.toJSON(),
                mode: Mode.OPEN,
                views: session.views + 1
            };
        }
        return {
            ...session.toJSON(),
            views: session.views + 1
        };
    }
}