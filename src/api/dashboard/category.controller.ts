import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../enums/user.enum';
import { CategoryService } from './category.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
  CategoryResponseDto,
  CategoryStatsDto,
} from './dto/category.dto';

@Controller('dashboard/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<{ data: CategoryResponseDto }> {
    const category = await this.categoryService.create(createCategoryDto);
    return { data: category };
  }

  @Get()
  @Roles(Role.ADMIN, Role.STUDENT, Role.TEACHER)
  async findAll(@Query() query: CategoryQueryDto): Promise<{ data: CategoryResponseDto[], total: number }> {
    const result = await this.categoryService.findAll(query);
    return { data: result.categories, total: result.total };
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  async getStats(): Promise<{ data: CategoryStatsDto }> {
    const stats = await this.categoryService.getStats();
    return { data: stats };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STUDENT, Role.TEACHER)
  async findOne(@Param('id') id: string): Promise<{ data: CategoryResponseDto }> {
    const category = await this.categoryService.findOne(id);
    return { data: category };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<{ data: CategoryResponseDto }> {
    const category = await this.categoryService.update(id, updateCategoryDto);
    return { data: category };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.categoryService.remove(id);
    return { message: 'Category deleted successfully' };
  }

  @Post('upload/icon')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadIcon(@UploadedFile() file: Express.Multer.File): Promise<{ data: { url: string } }> {
    const result = await this.categoryService.uploadIcon(file);
    return { data: result };
  }

  @Delete('icon/:url')
  @Roles(Role.ADMIN)
  async deleteIcon(@Param('url') url: string): Promise<{ message: string }> {
    await this.categoryService.deleteIcon(decodeURIComponent(url));
    return { message: 'Icon deleted successfully' };
  }
}
