import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseRegistrationDocument = CourseRegistration & Document;

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

@Schema({ timestamps: true })
export class CourseRegistration {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  courseId: string;

  @Prop({ required: true })
  status: RegistrationStatus;

  @Prop()
  message?: string; // Lời nhắn từ user khi đăng ký

  @Prop()
  adminNote?: string; // Ghi chú từ admin khi duyệt

  @Prop()
  processedBy?: string; // Admin ID xử lý

  @Prop()
  processedAt?: Date; // Thời gian xử lý
}

export const CourseRegistrationSchema = SchemaFactory.createForClass(CourseRegistration);
