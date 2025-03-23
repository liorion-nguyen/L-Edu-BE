import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message } from "src/scheme/message.schema";
import { CreateMessageRequest, SearchMessageRequest, UpdateMessageRequest } from "src/payload/request/message.request";
import { MessageResponse } from "src/payload/response/message.response";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Injectable()
export class MessageService {
    constructor(
        @InjectModel(Message.name) private readonly MessageModel: Model<Message>,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    async Search(query: SearchMessageRequest, user): Promise<{ data: MessageResponse[]; total: number }> {
        const { limit = 10, page = 0, chatRoomId, message, senderId } = query;
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
                .select("_id message senderId file createdAt")
                .populate("senderId", "_id fullName avatar")
                .lean<MessageResponse[]>()
                .sort({ createdAt: 1 })
                .exec(),
            this.MessageModel.countDocuments(filter).exec(),
        ]);
        return { data, total };
    }

    async CreateMessage(body: CreateMessageRequest, file: Express.Multer.File, user?): Promise<MessageResponse> {
        let message = new this.MessageModel({
            ...body,
            senderId: user._id,
        });
        
        if (file) {
            const fileRes = await this.cloudinaryService.uploadFile(file);
            message.file = {
                url: fileRes.secure_url,
                type: fileRes.type,
            };
        }
        const savedMessage = await message.save();

        return this.MessageModel.findById(savedMessage._id)
            .populate("senderId", "_id fullName avatar")
            .lean<MessageResponse>()
            .exec();
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

    async DeleteManyMessage(chatRoomId: string): Promise<string> {
        const messages = await this.MessageModel.find({ chatRoomId });
        if (!messages || messages.length === 0) {
            return `No messages to delete`;
        }

        const imageUrls = messages
            .map(message => message.file?.url)
            .filter(url => url);

        await Promise.all(imageUrls.map(url => this.cloudinaryService.deleteFileByUrl(url)));

        await this.MessageModel.deleteMany({ chatRoomId });

        return `Delete messages and images success`;
    }

}