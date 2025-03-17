import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ChatRoom } from "src/scheme/chat-room.schema";
import { UserService } from "../users/users.service";
import { UserCoreResponse } from "src/payload/response/users.response";
import { Role } from "src/enums/user.enum";
import { ChatRoomResponse } from "src/payload/response/chat-room.response";
import { CreateChatRoomRequest, GetMsgChatRoomRequest, SearchChatRoomRequest, UpdateChatRoomRequest } from "src/payload/request/chat-room.request";
import { MessageService } from "../message/message.service";

@Injectable()
export class ChatRoomService {
    constructor(
        @InjectModel(ChatRoom.name) private readonly ChatRoomModel: Model<ChatRoom>,
        private readonly userService: UserService,
        private readonly messageService: MessageService,
    ) { }

    async Search(query: SearchChatRoomRequest, user): Promise<{ data: ChatRoomResponse[]; total: number }> {
        const { limit = 6, page = 0, UserIdJoin, name } = query;
        const offset = page * limit;
        const filter: any = {};
        if (name) {
            filter.name = { $regex: name, $options: "i" };
        }
        if (UserIdJoin) {
            filter.membersId = { $in: [UserIdJoin] };
        }
        filter.$or = [
            { membersId: { $in: [user._id] } },
            { createdBy: user._id }
        ];
    
        const [data, total] = await Promise.all([
            this.ChatRoomModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .select("_id name membersId type createdBy")
                .lean<ChatRoomResponse[]>()
                .exec(),
            this.ChatRoomModel.countDocuments(filter).exec()
        ]);
        return { data, total };
    }      

    async CreateChatRoom(body: CreateChatRoomRequest, user): Promise<ChatRoom> {
        const ChatRoomExist = await this.ChatRoomModel.findOne({ name: body.name });
        if (ChatRoomExist) {
            throw new Error(`ChatRoom with name ${body.name} already exist`);
        }
        const ChatRoom = new this.ChatRoomModel({
            ...body,
            createdBy: user._id,
        });
        return ChatRoom.save();
    }

    async UpdateChatRoom(id: string, updateData: UpdateChatRoomRequest): Promise<ChatRoom> {
        const ChatRoom = await this.ChatRoomModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!ChatRoom) {
            throw new Error(`ChatRoom with id ${id} not found`);
        }
        return ChatRoom;
    }

    async DeleteChatRoom(id: string): Promise<string> {
        await this.messageService.DeleteManyMessage(id);
        const chatRoom = await this.ChatRoomModel.findByIdAndDelete(id);
        if (!chatRoom) {
            throw new Error(`ChatRoom with id ${id} not found`);
        }
        return `Deleted ChatRoom [${chatRoom.name}] and all its messages successfully`;
    }
    

    async GetChatRoom(_id: string, user, search: GetMsgChatRoomRequest): Promise<ChatRoomResponse> {
        const ChatRoom = await this.ChatRoomModel.findById(_id);
        if (!ChatRoom) {
            throw new Error(`ChatRoom with id ${_id} not found`);
        }

        if (user.role !== Role.ADMIN) {
            const isStudentEnrolled = ChatRoom.membersId.some((memberId: string) => memberId == user._id);
            if (!isStudentEnrolled) {
                throw new Error(`Member with id ${_id} is not enrolled in this ChatRoom`);
            }
        }

        const members = ChatRoom.membersId.map(async (memberId: string) => {
            const member = await this.userService.getUserCore(memberId);
            return member;
        });

        const messages = await this.messageService.Search({
            chatRoomId: _id,
            limit: search.limit || 10,
            page: search.page || 0,
        }, user);

        return {
            _id: ChatRoom._id as string,
            members: await Promise.all(members) as UserCoreResponse[],
            messages: messages.data,
            name: ChatRoom.name,
            type: ChatRoom.type,
            createdBy: ChatRoom.createdBy,
        };
    }

    async GetInformationChatRoom(_id: string, user): Promise<ChatRoomResponse> {
        const ChatRoom = await this.ChatRoomModel.findById(_id);
        if (!ChatRoom) {
            throw new Error(`ChatRoom with id ${_id} not found`);
        }

        if (user.role !== Role.ADMIN) {
            const isStudentEnrolled = ChatRoom.membersId.some((memberId: string) => memberId == user._id);
            if (!isStudentEnrolled) {
                throw new Error(`Member with id ${_id} is not enrolled in this ChatRoom`);
            }
        }

        return {
            _id: ChatRoom._id as string,
            membersId: ChatRoom.membersId,
            name: ChatRoom.name,
            type: ChatRoom.type,
            createdBy: ChatRoom.createdBy
        };
    }

}