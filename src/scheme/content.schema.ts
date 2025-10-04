import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContentDocument = Content & Document;

@Schema()
class ContentSection {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  image?: string;

  @Prop()
  buttonText?: string;

  @Prop()
  buttonLink?: string;

  @Prop({ default: true })
  isActive: boolean;
}

const ContentSectionSchema = SchemaFactory.createForClass(ContentSection);

@Schema({ timestamps: true })
export class Content {
  @Prop({ required: true })
  page: string; // 'about', 'home', 'contact', etc.

  @Prop({ required: true })
  section: string; // 'intro', 'team', 'courses', 'achievements', etc.

  @Prop({ required: true })
  title: string; // Section title

  @Prop({ required: true })
  subtitle: string; // Section subtitle

  @Prop({ type: [String], default: [] })
  descriptions: string[]; // Multiple paragraphs

  @Prop({ type: [ContentSectionSchema], default: [] })
  sections: ContentSection[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number; // Display order
}

export const ContentSchema = SchemaFactory.createForClass(Content);

// Index for efficient queries - composite unique index for page + section
ContentSchema.index({ page: 1, section: 1 }, { unique: true });

// Migration: Drop old unique index on page only if it exists
ContentSchema.pre('init', async function() {
  try {
    const db = this.db;
    const collection = db.collection('contents');
    
    // Check if old page_1 index exists and drop it
    const indexes = await collection.indexes();
    const hasOldIndex = indexes.some(index => 
      index.name === 'page_1' && 
      Object.keys(index.key).length === 1 && 
      index.key.page === 1
    );
    
    if (hasOldIndex) {
      console.log('🔄 Dropping old unique index on page...');
      await collection.dropIndex('page_1');
      console.log('✅ Old page index dropped');
    }
  } catch (error) {
    console.log('ℹ️ Index migration info:', error.message);
  }
});
