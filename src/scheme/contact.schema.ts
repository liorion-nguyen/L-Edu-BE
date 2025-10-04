import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true })
  type: string; // 'email', 'phone', 'address', 'social'

  @Prop({ required: true })
  label: string; // 'Email', 'Phone', 'Address', 'Facebook'

  @Prop({ required: true })
  value: string; // 'contact@ledu.com', '+84 123 456 789', '123 Main St', 'https://facebook.com/ledu'

  @Prop({ required: false })
  icon?: string; // Icon class or URL

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number; // For ordering display
}

export const ContactSchema = SchemaFactory.createForClass(Contact);


