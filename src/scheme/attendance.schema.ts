import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum AttendanceStatus {
  NOT_MARKED = 'NOT_MARKED',
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED', // nghỉ có phép
}

@Schema({ _id: false })
export class AttendanceRecord {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: String, enum: AttendanceStatus, default: AttendanceStatus.NOT_MARKED })
  status: AttendanceStatus;
}

export const AttendanceRecordSchema = SchemaFactory.createForClass(AttendanceRecord);

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  classId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Session', required: true })
  sessionId: string;

  @Prop({ type: [AttendanceRecordSchema], default: [] })
  records: AttendanceRecord[];
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ classId: 1, sessionId: 1 }, { unique: true });
