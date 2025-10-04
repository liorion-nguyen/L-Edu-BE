import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Footer, FooterDocument } from '../../scheme/footer.schema';
import { CreateFooterDto, UpdateFooterDto, FooterResponseDto } from './dto/footer.dto';

@Injectable()
export class FooterService {
  constructor(
    @InjectModel(Footer.name) private footerModel: Model<FooterDocument>,
  ) {}

  private mapToResponseDto(footer: FooterDocument): FooterResponseDto {
    return {
      _id: footer._id.toString(),
      section: footer.section,
      title: footer.title,
      links: footer.links.map(link => ({
        label: link.label,
        url: link.url,
        isExternal: link.isExternal,
        icon: link.icon,
        description: link.description,
      })),
      isActive: footer.isActive,
      order: footer.order,
      createdAt: (footer as any).createdAt,
      updatedAt: (footer as any).updatedAt,
    };
  }

  async create(createFooterDto: CreateFooterDto): Promise<FooterResponseDto> {
    const footer = new this.footerModel(createFooterDto);
    const savedFooter = await footer.save();
    return this.mapToResponseDto(savedFooter);
  }

  async findAll(): Promise<FooterResponseDto[]> {
    const footers = await this.footerModel
      .find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .exec();
    return footers.map(footer => this.mapToResponseDto(footer));
  }

  async findAllAdmin(): Promise<FooterResponseDto[]> {
    const footers = await this.footerModel
      .find()
      .sort({ order: 1, createdAt: 1 })
      .exec();
    return footers.map(footer => this.mapToResponseDto(footer));
  }

  async findOne(id: string): Promise<FooterResponseDto> {
    const footer = await this.footerModel.findById(id).exec();
    if (!footer) {
      throw new NotFoundException('Footer section not found');
    }
    return this.mapToResponseDto(footer);
  }

  async update(id: string, updateFooterDto: UpdateFooterDto): Promise<FooterResponseDto> {
    const footer = await this.footerModel
      .findByIdAndUpdate(id, updateFooterDto, { new: true })
      .exec();
    if (!footer) {
      throw new NotFoundException('Footer section not found');
    }
    return this.mapToResponseDto(footer);
  }

  async remove(id: string): Promise<void> {
    const result = await this.footerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Footer section not found');
    }
  }

  async getBySection(section: string): Promise<FooterResponseDto[]> {
    const footers = await this.footerModel
      .find({ section, isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .exec();
    return footers.map(footer => this.mapToResponseDto(footer));
  }
}
