import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../enums/user.enum';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createContactDto: CreateContactDto) {
    const contact = await this.contactService.create(createContactDto);
    return {
      success: true,
      message: 'Contact created successfully',
      data: contact,
    };
  }

  @Get()
  async findAll() {
    const contacts = await this.contactService.findAll();
    return {
      success: true,
      message: 'Contacts retrieved successfully',
      data: contacts,
    };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAllAdmin() {
    const contacts = await this.contactService.findAllAdmin();
    return {
      success: true,
      message: 'Contacts retrieved successfully',
      data: contacts,
    };
  }

  @Get('type/:type')
  async getByType(@Param('type') type: string) {
    const contacts = await this.contactService.getByType(type);
    return {
      success: true,
      message: 'Contacts retrieved successfully',
      data: contacts,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const contact = await this.contactService.findOne(id);
    return {
      success: true,
      message: 'Contact retrieved successfully',
      data: contact,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    const contact = await this.contactService.update(id, updateContactDto);
    return {
      success: true,
      message: 'Contact updated successfully',
      data: contact,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.contactService.remove(id);
    return {
      success: true,
      message: 'Contact deleted successfully',
    };
  }
}


