import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

export enum SessionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum SessionType {
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
}

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, maxlength: 2000 })
  description: string;

  @Prop({ required: true })
  courseId: string;

  @Prop({ required: true })
  instructorId: string;

  @Prop({ enum: SessionType, default: SessionType.VIDEO })
  type: SessionType;

  @Prop({ enum: SessionStatus, default: SessionStatus.DRAFT })
  status: SessionStatus;

  @Prop({ default: 0 })
  duration: number; // in minutes

  @Prop({ default: 0 })
  order: number; // order within course

  @Prop({ default: 1 })
  sessionNumber: number; // session number within course

  @Prop({ type: Object })
  videoUrl?: {
    videoUrl?: string;
    mode?: string;
  };

  @Prop()
  thumbnail?: string;

  @Prop({ type: Object })
  notesMd?: {
    notesMd?: any;
    mode?: string;
  };

  @Prop({ type: Object })
  quizId?: {
    quizId?: string;
    mode?: string;
  };

  @Prop()
  mode?: string; // Session mode (OPEN/CLOSE)

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ type: [String], default: [] })
  students: string[];

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  completionRate: number;

  @Prop()
  content?: string; // Rich text content for TEXT type sessions

  @Prop({ type: Object })
  quizData?: any; // JSON data for QUIZ type sessions

  @Prop({ type: Object })
  assignmentData?: any; // JSON data for ASSIGNMENT type sessions
}

export const SessionSchema = SchemaFactory.createForClass(Session);