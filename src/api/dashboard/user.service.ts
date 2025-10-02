import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../scheme/user.schema';
import { CreateUserDto, UpdateUserDto, UserQueryDto, UserResponseDto, UserStatsDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getAllUsers(query: UserQueryDto): Promise<{ users: UserResponseDto[]; total: number }> {
    const {
      search,
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    // Build filter object
    const filter: any = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip
    const skip = (page - 1) * limit;

    try {
      const [users, total] = await Promise.all([
        this.userModel
          .find(filter)
          .select('-password') // Exclude password from response
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
        this.userModel.countDocuments(filter).exec(),
      ]);

      return {
        users: users.map(user => this.mapToResponseDto(user)),
        total,
      };
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getUserById(id: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.userModel.findById(id).select('-password').exec();
      return user ? this.mapToResponseDto(user) : null;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.userModel.findOne({ email }).select('-password').exec();
      return user ? this.mapToResponseDto(user) : null;
    } catch (error) {
      throw new Error(`Failed to fetch user by email: ${error.message}`);
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Create user object
      const userData = {
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role || 'STUDENT',
        status: createUserDto.status || 'ACTIVE',
        bio: createUserDto.bio || '',
      };

      const user = new this.userModel(userData);
      const savedUser = await user.save();

      return this.mapToResponseDto(savedUser);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto | null> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        id,
        { ...updateUserDto, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password').exec();

      return user ? this.mapToResponseDto(user) : null;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async deleteUser(id: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.userModel.findByIdAndDelete(id).select('-password').exec();
      return user ? this.mapToResponseDto(user) : null;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async getUserStats(): Promise<UserStatsDto> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        studentUsers,
        newUsersThisMonth,
        newUsersThisWeek,
      ] = await Promise.all([
        this.userModel.countDocuments().exec(),
        this.userModel.countDocuments({ status: 'ACTIVE' }).exec(),
        this.userModel.countDocuments({ status: 'INACTIVE' }).exec(),
        this.userModel.countDocuments({ role: 'ADMIN' }).exec(),
        this.userModel.countDocuments({ role: 'STUDENT' }).exec(),
        this.userModel.countDocuments({ createdAt: { $gte: startOfMonth } }).exec(),
        this.userModel.countDocuments({ createdAt: { $gte: startOfWeek } }).exec(),
      ]);

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        studentUsers,
        newUsersThisMonth,
        newUsersThisWeek,
      };
    } catch (error) {
      throw new Error(`Failed to fetch user statistics: ${error.message}`);
    }
  }

  private mapToResponseDto(user: UserDocument): UserResponseDto {
    return {
      _id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      gender: user.gender,
      birthday: user.birthday,
      phone: user.phone,
      role: user.role,
      status: user.status,
      bio: user.bio,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
      lastLogin: user.lastLogin,
    };
  }
}
