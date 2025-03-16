import { UserCoreResponse } from "./users.response";

export class MessageResponse {
    _id: string;

    chatRoomId: string;

    senderId: UserCoreResponse | string;

    message: string;

    file: File;

    createdAt?: Date;

    updatedAt?: Date;
}