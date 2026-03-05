import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, maxlength: 100 })
  name: string;

  @Prop({ maxlength: 500 })
  description?: string;

  @Prop()
  icon?: string; // URL to category icon

  @Prop()
  color?: string; // Hex color code for category

  @Prop({ default: 0 })
  courseCount: number; // Number of courses in this category

  @Prop({ default: true })
  isActive: boolean; // Whether category is active

  @Prop({ default: 0 })
  order: number; // Display order
}

export const CategorySchema = SchemaFactory.createForClass(Category);
