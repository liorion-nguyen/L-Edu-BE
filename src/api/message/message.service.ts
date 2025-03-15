import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserService } from "../users/users.service";
import { UserCoreResponse } from "src/payload/response/users.response";
import { Role } from "src/enums/user.enum";
import { Message } from "src/scheme/message.schema";
import { CreateMessageRequest, SearchMessageRequest, UpdateMessageRequest } from "src/payload/request/message.request";
import { MessageResponse } from "src/payload/response/message.response";

@Injectable()
export class MessageService {
    constructor(
        @InjectModel(Message.name) private readonly MessageModel: Model<Message>,
        private readonly userService: UserService,
    ) { }

    async Search(query: SearchMessageRequest, user): Promise<{ data: MessageResponse[]; total: number }> {
        const { limit = 6, page = 0, chatRoomId, message, senderId } = query;
        const offset = page * limit;
        const filter: any = {};
        // Lọc theo nội dung tin nhắn (tìm kiếm không phân biệt chữ hoa/thường)
        if (message) {
            filter.message = { $regex: message, $options: "i" };
        }
        // Lọc theo ID người gửi (chính xác, không dùng regex)
        if (senderId) {
            filter.senderId = senderId;
        }
        // Lọc theo chatRoomId (chỉ lấy tin nhắn trong phòng chat cụ thể)
        if (chatRoomId) {
            filter.chatRoomId = chatRoomId;
        }
        // Thực hiện truy vấn tối ưu
        const [data, total] = await Promise.all([
            this.MessageModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .select("_id message senderId file") 
                .populate("senderId", "_id fullName avatar") 
                .lean<MessageResponse[]>()
                .exec(),
            this.MessageModel.countDocuments(filter).exec()
        ]);
        return { data, total };
    }

    async CreateMessage(body: CreateMessageRequest, user): Promise<Message> {
        const Message = new this.MessageModel({
            ...body,
            senderId: user._id,
        });
        return Message.save();
    }

    async UpdateMessage(id: string, updateData: UpdateMessageRequest): Promise<Message> {
        const Message = await this.MessageModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!Message) {
            throw new Error(`Message with id ${id} not found`);
        }
        return Message;
    }

    async DeleteMessage(id: string): Promise<string> {
        const Message = await this.MessageModel.findByIdAndDelete(id);
        if (!Message) {
            throw new Error(`Message with id ${id} not found`);
        }
        return `Delete Message success`;
    }

    async GetMessage(_id: string): Promise<MessageResponse> {
        const message = await this.MessageModel.findById(_id).lean<MessageResponse>().exec();
        if (!message) {
            throw new Error(`Message with id ${_id} not found`);
        }
        return message;
    }
}