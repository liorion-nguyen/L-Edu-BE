import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FooterService } from './footer.service';
import { CreateFooterDto, UpdateFooterDto } from './dto/footer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../enums/user.enum';
import { SkipAuth } from '../../config/skip.auth';

@Controller('footer')
export class FooterController {
  constructor(private readonly footerService: FooterService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createFooterDto: CreateFooterDto) {
    const footer = await this.footerService.create(createFooterDto);
    return {
      success: true,
      message: 'Footer section created successfully',
      data: footer,
    };
  }

  @Get()
  @SkipAuth()
  async findAll() {
    const footers = await this.footerService.findAll();
    return {
      success: true,
      message: 'Footer sections retrieved successfully',
      data: footers,
    };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAllAdmin() {
    const footers = await this.footerService.findAllAdmin();
    return {
      success: true,
      message: 'Footer sections retrieved successfully',
      data: footers,
    };
  }

  @Get('section/:section')
  @SkipAuth()
  async getBySection(@Param('section') section: string) {
    const footers = await this.footerService.getBySection(section);
    return {
      success: true,
      message: 'Footer sections retrieved successfully',
      data: footers,
    };
  }

  @Get(':id')
  @SkipAuth()
  async findOne(@Param('id') id: string) {
    const footer = await this.footerService.findOne(id);
    return {
      success: true,
      message: 'Footer section retrieved successfully',
      data: footer,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateFooterDto: UpdateFooterDto) {
    const footer = await this.footerService.update(id, updateFooterDto);
    return {
      success: true,
      message: 'Footer section updated successfully',
      data: footer,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.footerService.remove(id);
    return {
      success: true,
      message: 'Footer section deleted successfully',
    };
  }
}


