import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto, UpdateContentDto } from './dto/content.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../enums/user.enum';
import { SkipAuth } from '../../config/skip.auth';
import { successResponse } from '../../common/dto/response.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createContentDto: CreateContentDto) {
    const content = await this.contentService.create(createContentDto);
    return successResponse(content);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll() {
    const contents = await this.contentService.findAll();
    return successResponse(contents);
  }

  @Get('page/:page')
  @SkipAuth()
  async findByPage(@Param('page') page: string) {
    const contents = await this.contentService.findByPage(page);
    return successResponse(contents);
  }

  @Get('page/:page/section/:section')
  @SkipAuth()
  async findByPageAndSection(@Param('page') page: string, @Param('section') section: string) {
    const content = await this.contentService.findByPageAndSection(page, section);
    if (!content) {
      return successResponse(null);
    }
    return successResponse(content);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
    const content = await this.contentService.updateById(id, updateContentDto);
    return successResponse(content);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.contentService.removeById(id);
    return successResponse(null);
  }
}
