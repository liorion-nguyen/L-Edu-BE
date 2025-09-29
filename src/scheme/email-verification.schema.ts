import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailVerificationDocument = EmailVerification & Document;

@Schema({ timestamps: true })
export class EmailVerification {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true, default: false })
  isVerified: boolean;

  @Prop({ required: true, default: Date.now, expires: 3600 }) // Token expires in 1 hour
  createdAt: Date;
}

export const EmailVerificationSchema = SchemaFactory.createForClass(EmailVerification);
