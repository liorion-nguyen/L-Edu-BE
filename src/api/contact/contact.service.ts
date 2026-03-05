import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from '../../scheme/contact.schema';
import { CreateContactDto, UpdateContactDto, ContactResponseDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) {}

  private mapToResponseDto(contact: ContactDocument): ContactResponseDto {
    return {
      _id: contact._id.toString(),
      type: contact.type,
      label: contact.label,
      value: contact.value,
      icon: contact.icon,
      isActive: contact.isActive,
      order: contact.order,
      createdAt: (contact as any).createdAt,
      updatedAt: (contact as any).updatedAt,
    };
  }

  async create(createContactDto: CreateContactDto): Promise<ContactResponseDto> {
    const contact = new this.contactModel(createContactDto);
    const savedContact = await contact.save();
    return this.mapToResponseDto(savedContact);
  }

  async findAll(): Promise<ContactResponseDto[]> {
    const contacts = await this.contactModel
      .find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .exec();
    return contacts.map(contact => this.mapToResponseDto(contact));
  }

  async findAllAdmin(): Promise<ContactResponseDto[]> {
    const contacts = await this.contactModel
      .find()
      .sort({ order: 1, createdAt: 1 })
      .exec();
    return contacts.map(contact => this.mapToResponseDto(contact));
  }

  async findOne(id: string): Promise<ContactResponseDto> {
    const contact = await this.contactModel.findById(id).exec();
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return this.mapToResponseDto(contact);
  }

  async update(id: string, updateContactDto: UpdateContactDto): Promise<ContactResponseDto> {
    const contact = await this.contactModel
      .findByIdAndUpdate(id, updateContactDto, { new: true })
      .exec();
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return this.mapToResponseDto(contact);
  }

  async remove(id: string): Promise<void> {
    const result = await this.contactModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Contact not found');
    }
  }

  async getByType(type: string): Promise<ContactResponseDto[]> {
    const contacts = await this.contactModel
      .find({ type, isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .exec();
    return contacts.map(contact => this.mapToResponseDto(contact));
  }
}


