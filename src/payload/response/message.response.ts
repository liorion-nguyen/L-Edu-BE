export class MessageResponse {
    _id: string;

    chatRoomId: string;

    senderId: string;

    message: string;

    file: File;

    createdAt?: Date;

    updatedAt?: Date;
}