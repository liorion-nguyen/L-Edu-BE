import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class StudentComment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: String, default: '' })
  comment: string;
}
export const StudentCommentSchema = SchemaFactory.createForClass(StudentComment);

export type SessionNoteDocument = SessionNote & Document;

@Schema({ timestamps: true })
export class SessionNote {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  classId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Session', required: true })
  sessionId: string;

  @Prop({ type: String, default: '' })
  sessionContent: string;

  @Prop({ type: String, default: '' })
  homework: string;

  @Prop({ type: [StudentCommentSchema], default: [] })
  studentComments: StudentComment[];
}

export const SessionNoteSchema = SchemaFactory.createForClass(SessionNote);
SessionNoteSchema.index({ classId: 1, sessionId: 1 }, { unique: true });
