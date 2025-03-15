import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { TypeFile } from "src/enums/message.enum";

export class File {
    url: string;
    type: TypeFile;
}

@Schema({ timestamps: true })
export class Message extends Document {
    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: "ChatRoom", description: 'Chat Room ID' })
    chatRoomId: string;

    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: "User", description: 'Sender User ID' })
    senderId: string;

    @Prop({ required: false, type: String, description: 'Message Content' })
    message: string;

    @Prop({ required: false, type: File, description: 'Link Url File' })
    file?: File;
}
export const MessageSchema = SchemaFactory.createForClass(Message);