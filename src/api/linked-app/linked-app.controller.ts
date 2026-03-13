import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LinkedAppService } from './linked-app.service';
import { CreateLinkedAppDto, UpdateLinkedAppDto } from './dto/linked-app.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../enums/user.enum';
import { SkipAuth } from '../../config/skip.auth';

@Controller('linked-apps')
export class LinkedAppController {
  constructor(private readonly linkedAppService: LinkedAppService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createLinkedAppDto: CreateLinkedAppDto) {
    const app = await this.linkedAppService.create(createLinkedAppDto);
    return {
      success: true,
      message: 'Linked app created successfully',
      data: app,
    };
  }

  @Get()
  @SkipAuth()
  async findAll() {
    const apps = await this.linkedAppService.findAll();
    return {
      success: true,
      message: 'Linked apps retrieved successfully',
      data: apps,
    };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAllAdmin() {
    const apps = await this.linkedAppService.findAllAdmin();
    return {
      success: true,
      message: 'Linked apps retrieved successfully',
      data: apps,
    };
  }

  @Get('category/:category')
  @SkipAuth()
  async getByCategory(@Param('category') category: string) {
    const apps = await this.linkedAppService.getByCategory(category);
    return {
      success: true,
      message: 'Linked apps retrieved successfully',
      data: apps,
    };
  }

  @Get(':id')
  @SkipAuth()
  async findOne(@Param('id') id: string) {
    const app = await this.linkedAppService.findOne(id);
    return {
      success: true,
      message: 'Linked app retrieved successfully',
      data: app,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateLinkedAppDto: UpdateLinkedAppDto) {
    const app = await this.linkedAppService.update(id, updateLinkedAppDto);
    return {
      success: true,
      message: 'Linked app updated successfully',
      data: app,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.linkedAppService.remove(id);
    return {
      success: true,
      message: 'Linked app deleted successfully',
    };
  }
}
