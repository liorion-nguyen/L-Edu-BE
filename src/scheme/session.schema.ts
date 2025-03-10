import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Mode } from 'src/enums/session.enum';

export class NotesMd {
    @Prop({ required: true, type: String, description: 'Mode of the notesMd' })
    mode: Mode;

    @Prop({ required: true, type: String, description: 'Markdown content for session notes' })
    notesMd: string;
}

export class VideoUrl {
    @Prop({ required: true, type: String, description: 'Mode of the videoUrl' })
    mode: Mode;

    @Prop({ required: true, type: String, description: 'URL of the session video' })
    videoUrl: string;
}


export class QuizId {
    @Prop({ required: true, type: String, description: 'Quiz ID linked to this session' })
    quizId: string;

    @Prop({ required: true, type: String, description: 'Mode of the quizId' })
    mode: Mode;
}

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ required: true, type: Number, description: 'Session number in the course' })
  sessionNumber: number;

  @Prop({ required: true, type: String, description: 'Title of the session' })
  title: string;

  @Prop({ default: 0, type: Number, description: 'Number of views for the session' })
  views: number;

  @Prop({ type: QuizId, required: false, description: 'Quiz ID linked to this session' })
  quizId?: QuizId;

  @Prop({ type: VideoUrl, required: false, description: 'URL of the session video' })
  videoUrl?: VideoUrl;

  @Prop({ type: NotesMd, required: false, description: 'Markdown content for session notes' })
  notesMd?: NotesMd; 
}

export const SessionSchema = SchemaFactory.createForClass(Session);