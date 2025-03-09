import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserRequest, SearchUserRequest } from "src/payload/request/users.request";
import { User } from "src/scheme/user.schema";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }

    async Search(query: SearchUserRequest): Promise<{ data: User[]; total: number }> {
        const { limit = 6, page = 0 } = query;
        const offset = page * limit;
        const filter: any = {};

        if (query.email) {
            filter.email = { $regex: query.email, $options: "i" };
        }

        if (query.fullName) {
            filter.fullName = { $regex: query.fullName, $options: "i" };
        }

        const data = await this.userModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .exec();

        const total = await this.userModel.countDocuments(filter).exec();

        return {
            data: data,
            total,
        };
    }

    async findUserById(id: any): Promise<User> {
        const user = await this.userModel.findById(id).select("-password").exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async CreateUser(body: CreateUserRequest): Promise<User> {
        const userExist = await this.findUserById(body.email);
        if (userExist) {
            throw new NotFoundException(`User with email ${body.email} already exist`);
        }
        const hashPassword = await bcrypt.hash(body.password, 10);
        body.password = hashPassword;
        const user = new this.userModel(body);
        return user.save();
    }
}