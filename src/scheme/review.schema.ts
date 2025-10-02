import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, type: String, ref: 'User' })
  userId: string;

  @Prop({ required: true, type: String, ref: 'Course' })
  courseId: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, maxlength: 1000 })
  comment: string;

  @Prop({ default: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status: string;

  @Prop({ default: false })
  isAnonymous: boolean;

  @Prop({ default: false })
  isHidden: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Index for efficient queries
ReviewSchema.index({ courseId: 1, status: 1 });
ReviewSchema.index({ userId: 1, courseId: 1 }, { unique: true }); // One review per user per course
