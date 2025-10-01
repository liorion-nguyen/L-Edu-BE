import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TypeFile } from 'src/enums/message.enum';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop()
  chatRoomId?: string;

  @Prop()
  content?: string;

  @Prop()
  senderId?: string;

  @Prop({
    type: String,
    enum: Object.values(TypeFile),
  })
  type?: TypeFile;

  @Prop({ type: Object })
  file?: {
    url: string;
    type?: string;
    fileName?: string;
    fileSize?: number;
  };
}

export const MessageSchema = SchemaFactory.createForClass(Message);