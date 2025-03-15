import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TypeChatRoom } from 'src/enums/message.enum';

@Schema({ timestamps: true })
export class ChatRoom extends Document {
    @Prop({ required: true, type: String, description: 'Name of the chat room' })
    name: string;

    @Prop({ type: [String], required: true, description: 'User IDs in the chat room' })
    membersId: string[];

    @Prop({ type: String, enum: TypeChatRoom, default: TypeChatRoom.PRIVATE })
    type: TypeChatRoom;

    @Prop({ required: true, type: String, description: 'User ID who created the chat room' })
    createdBy: string;
}
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);