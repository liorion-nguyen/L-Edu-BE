import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FooterDocument = Footer & Document;

@Schema({ timestamps: true })
export class Footer {
  @Prop({ required: true })
  section: string; // 'company', 'support', 'legal', 'social'

  @Prop({ required: true })
  title: string; // 'Company', 'Support', 'Legal', 'Follow Us'

  @Prop({ type: [{
    label: { type: String, required: true },
    url: { type: String, required: true },
    isExternal: { type: Boolean, default: false },
    icon: { type: String },
    description: { type: String }
  }], default: [] })
  links: Array<{
    label: string;
    url: string;
    isExternal: boolean;
    icon?: string;
    description?: string;
  }>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number; // For ordering display
}

export const FooterSchema = SchemaFactory.createForClass(Footer);
