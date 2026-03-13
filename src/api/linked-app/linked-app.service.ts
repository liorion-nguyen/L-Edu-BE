import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LinkedApp, LinkedAppDocument } from '../../scheme/linked-app.schema';
import { CreateLinkedAppDto, UpdateLinkedAppDto, LinkedAppResponseDto } from './dto/linked-app.dto';

@Injectable()
export class LinkedAppService {
  constructor(
    @InjectModel(LinkedApp.name) private linkedAppModel: Model<LinkedAppDocument>,
  ) {}

  private mapToResponseDto(app: LinkedAppDocument): LinkedAppResponseDto {
    return {
      _id: app._id.toString(),
      name: app.name,
      url: app.url,
      description: app.description,
      icon: app.icon,
      image: app.image,
      category: app.category,
      isActive: app.isActive,
      order: app.order,
      openInNewTab: app.openInNewTab,
      metadata: app.metadata,
      createdAt: (app as any).createdAt,
      updatedAt: (app as any).updatedAt,
    };
  }

  async create(createLinkedAppDto: CreateLinkedAppDto): Promise<LinkedAppResponseDto> {
    const app = new this.linkedAppModel(createLinkedAppDto);
    const savedApp = await app.save();
    return this.mapToResponseDto(savedApp);
  }

  async findAll(): Promise<LinkedAppResponseDto[]> {
    const apps = await this.linkedAppModel
      .find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .exec();
    return apps.map(app => this.mapToResponseDto(app));
  }

  async findAllAdmin(): Promise<LinkedAppResponseDto[]> {
    const apps = await this.linkedAppModel
      .find()
      .sort({ order: 1, createdAt: 1 })
      .exec();
    return apps.map(app => this.mapToResponseDto(app));
  }

  async findOne(id: string): Promise<LinkedAppResponseDto> {
    const app = await this.linkedAppModel.findById(id).exec();
    if (!app) {
      throw new NotFoundException('Linked app not found');
    }
    return this.mapToResponseDto(app);
  }

  async update(id: string, updateLinkedAppDto: UpdateLinkedAppDto): Promise<LinkedAppResponseDto> {
    const app = await this.linkedAppModel
      .findByIdAndUpdate(id, updateLinkedAppDto, { new: true })
      .exec();
    if (!app) {
      throw new NotFoundException('Linked app not found');
    }
    return this.mapToResponseDto(app);
  }

  async remove(id: string): Promise<void> {
    const result = await this.linkedAppModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Linked app not found');
    }
  }

  async getByCategory(category: string): Promise<LinkedAppResponseDto[]> {
    const apps = await this.linkedAppModel
      .find({ category, isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .exec();
    return apps.map(app => this.mapToResponseDto(app));
  }
}
