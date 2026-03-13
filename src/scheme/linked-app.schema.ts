import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LinkedAppDocument = LinkedApp & Document;

@Schema({ timestamps: true })
export class LinkedApp {
  @Prop({ required: true })
  name: string; // 'Photobooth', 'App Name'

  @Prop({ required: true })
  url: string; // 'https://photobooth-chanh.vercel.app/'

  @Prop({ required: false })
  description?: string; // Mô tả về ứng dụng

  @Prop({ required: false })
  icon?: string; // URL icon hoặc emoji

  @Prop({ required: false })
  image?: string; // URL ảnh preview

  @Prop({ required: false })
  category?: string; // 'photography', 'utility', 'entertainment', etc.

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number; // For ordering display

  @Prop({ default: false })
  openInNewTab: boolean; // Mở trong tab mới hay không

  @Prop({ type: Object, default: {} })
  metadata?: {
    // Thông tin bổ sung
    features?: string[]; // ['Chụp ảnh', 'Filter & khung', 'Lưu & chia sẻ']
    stats?: {
      users?: string; // '10K+'
      photos?: string; // '50K+'
      rating?: string; // '4.9/5'
      satisfaction?: string; // '99%'
    };
    story?: string; // Câu chuyện về ứng dụng
    capabilities?: string[]; // ['Chụp ảnh', 'Chỉnh filter', 'Lưu & chia sẻ']
  };
}

export const LinkedAppSchema = SchemaFactory.createForClass(LinkedApp);
