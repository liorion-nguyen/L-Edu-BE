import { TypeChatRoom } from "src/enums/message.enum";
import { UserCoreResponse } from "./users.response";
import { MessageResponse } from "./message.response";

export class ChatRoomResponse {
    _id: string;

    name: string;

    members: UserCoreResponse[] | string[];

    type: TypeChatRoom;

    createdBy: string;

    messages?: MessageResponse[];
}