import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage extends Document {
  @Prop({ required: true })
  conversationId: string;

  @Prop({ default: '' })
  content: string;

  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: string;

  @Prop({ default: false })
  isStreaming: boolean;

  @Prop({ default: false })
  isComplete: boolean;

  @Prop({ type: [String] })
  imageUrls?: string[]; // Lưu URLs của ảnh đã upload
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
