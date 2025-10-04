import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from '../../scheme/content.schema';
import { CreateContentDto, UpdateContentDto, ContentResponseDto } from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
  ) {}

  private mapToResponseDto(content: ContentDocument): ContentResponseDto {
    return {
      _id: content._id.toString(),
      page: content.page,
      section: content.section,
      title: content.title,
      subtitle: content.subtitle,
      descriptions: content.descriptions,
      sections: content.sections,
      isActive: content.isActive,
      order: content.order,
      createdAt: (content as any).createdAt,
      updatedAt: (content as any).updatedAt,
    };
  }

  async create(createContentDto: CreateContentDto): Promise<ContentResponseDto> {
    const createdContent = new this.contentModel(createContentDto);
    const savedContent = await createdContent.save();
    return this.mapToResponseDto(savedContent);
  }

  async findAll(): Promise<ContentResponseDto[]> {
    const contents = await this.contentModel.find().sort({ page: 1, order: 1 }).exec();
    return contents.map(content => this.mapToResponseDto(content));
  }

  async findByPage(page: string): Promise<ContentResponseDto[]> {
    const contents = await this.contentModel
      .find({ page, isActive: true })
      .sort({ order: 1 })
      .exec();
    return contents.map(content => this.mapToResponseDto(content));
  }

  async findByPageAndSection(page: string, section: string): Promise<ContentResponseDto | null> {
    const content = await this.contentModel.findOne({ page, section }).exec();
    return content ? this.mapToResponseDto(content) : null;
  }

  async updateById(id: string, updateContentDto: UpdateContentDto): Promise<ContentResponseDto> {
    const updatedContent = await this.contentModel
      .findByIdAndUpdate(id, updateContentDto, { new: true })
      .exec();
    
    if (!updatedContent) {
      throw new NotFoundException(`Content with id ${id} not found`);
    }
    
    return this.mapToResponseDto(updatedContent);
  }

  async removeById(id: string): Promise<void> {
    const result = await this.contentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Content with id ${id} not found`);
    }
  }
}
