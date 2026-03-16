import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum ClassStatus {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  PENDING = 'PENDING',
}

@Schema({ _id: false })
export class ClassScheduleSlot {
  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  timeStart: string;

  @Prop({ required: true })
  timeEnd: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false, default: null })
  teacherId: string | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false, default: null })
  mentorId: string | null;
}

export const ClassScheduleSlotSchema = SchemaFactory.createForClass(ClassScheduleSlot);

@Schema({ _id: false })
export class ClassEnrollment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: Date, default: Date.now })
  enrolledAt: Date;
}
export const ClassEnrollmentSchema = SchemaFactory.createForClass(ClassEnrollment);

export type ClassDocument = Class & Document;

@Schema({ timestamps: true })
export class Class {
  @Prop({ required: true, maxlength: 200 })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  courseId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false, default: null })
  teacherId: string | null;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', default: [] })
  studentIds: string[];

  @Prop({ type: String, enum: ClassStatus, default: ClassStatus.ACTIVE })
  status: ClassStatus;

  @Prop({ type: String, default: '1' })
  scheduleFrequency: string;

  @Prop({ type: Number, default: 14 })
  totalSessions: number;

  @Prop({ type: [ClassScheduleSlotSchema], default: [] })
  scheduleSlots: ClassScheduleSlot[];

  @Prop({ type: [ClassEnrollmentSchema], default: [] })
  enrollments: ClassEnrollment[];
}

export const ClassSchema = SchemaFactory.createForClass(Class);
ClassSchema.index({ courseId: 1 });
ClassSchema.index({ teacherId: 1 });
ClassSchema.index({ status: 1, createdAt: -1 });
