import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../scheme/category.schema';
import { Course, CourseDocument } from '../../scheme/course.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryQueryDto, 
  CategoryResponseDto, 
  CategoryStatsDto 
} from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll(query: CategoryQueryDto): Promise<{ categories: CategoryResponseDto[], total: number }> {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [categories, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments(filter),
    ]);

    // Calculate actual course count for each category
    const categoriesWithCourseCount = await Promise.all(
      categories.map(async (category) => {
        const actualCourseCount = await this.courseModel.countDocuments({ 
          categoryId: category._id.toString() 
        }).exec();
        return this.mapToResponseDtoWithCourseCount(category, actualCourseCount);
      })
    );

    return {
      categories: categoriesWithCourseCount,
      total,
    };
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    
    // Calculate actual course count
    const actualCourseCount = await this.courseModel.countDocuments({ 
      categoryId: category._id.toString() 
    }).exec();
    
    return this.mapToResponseDtoWithCourseCount(category, actualCourseCount);
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    // Check if category name already exists
    const existingCategory = await this.categoryModel.findOne({ 
      name: createCategoryDto.name 
    }).exec();
    
    if (existingCategory) {
      throw new BadRequestException('Category name already exists');
    }

    const category = new this.categoryModel(createCategoryDto);
    const savedCategory = await category.save();
    
    // Calculate actual course count (should be 0 for new category)
    const actualCourseCount = await this.courseModel.countDocuments({ 
      categoryId: savedCategory._id.toString() 
    }).exec();
    
    return this.mapToResponseDtoWithCourseCount(savedCategory, actualCourseCount);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    // Check if category name already exists (excluding current category)
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryModel.findOne({ 
        name: updateCategoryDto.name,
        _id: { $ne: id }
      }).exec();
      
      if (existingCategory) {
        throw new BadRequestException('Category name already exists');
      }
    }

    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      updateCategoryDto,
      { new: true }
    ).exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Calculate actual course count
    const actualCourseCount = await this.courseModel.countDocuments({ 
      categoryId: category._id.toString() 
    }).exec();

    return this.mapToResponseDtoWithCourseCount(category, actualCourseCount);
  }

  async remove(id: string): Promise<void> {
    // Check if category has courses
    const courseCount = await this.courseModel.countDocuments({ categoryId: id }).exec();
    if (courseCount > 0) {
      throw new BadRequestException('Cannot delete category with existing courses');
    }

    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }
  }

  async uploadIcon(file: Express.Multer.File): Promise<{ url: string }> {
    try {
      const result = await this.cloudinaryService.uploadFile(file);
      return { url: result.secure_url };
    } catch (error) {
      throw new BadRequestException('Failed to upload icon');
    }
  }

  async deleteIcon(iconUrl: string): Promise<void> {
    try {
      await this.cloudinaryService.deleteFileByUrl(iconUrl);
    } catch (error) {
      throw new BadRequestException('Failed to delete icon');
    }
  }

  async getStats(): Promise<CategoryStatsDto> {
    const [totalCategories, activeCategories, totalCourses] = await Promise.all([
      this.categoryModel.countDocuments(),
      this.categoryModel.countDocuments({ isActive: true }),
      this.courseModel.countDocuments(),
    ]);

    return {
      totalCategories,
      activeCategories,
      inactiveCategories: totalCategories - activeCategories,
      totalCourses,
    };
  }

  async updateCourseCount(categoryId: string): Promise<void> {
    const courseCount = await this.courseModel.countDocuments({ categoryId }).exec();
    await this.categoryModel.findByIdAndUpdate(categoryId, { courseCount }).exec();
  }

  private mapToResponseDto(category: CategoryDocument): CategoryResponseDto {
    return {
      _id: category._id.toString(),
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      courseCount: category.courseCount,
      isActive: category.isActive,
      order: category.order,
      createdAt: (category as any).createdAt,
      updatedAt: (category as any).updatedAt,
    };
  }

  private mapToResponseDtoWithCourseCount(category: CategoryDocument, actualCourseCount: number): CategoryResponseDto {
    return {
      _id: category._id.toString(),
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      courseCount: actualCourseCount, // Use actual count from database
      isActive: category.isActive,
      order: category.order,
      createdAt: (category as any).createdAt,
      updatedAt: (category as any).updatedAt,
    };
  }
}
