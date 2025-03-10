import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SearchUserRequest, UpdateUserRequest } from "src/payload/request/users.request";
import { User } from "src/scheme/user.schema";

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

    async findUserByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).lean().exec();
    }

    async findUserById(id: any): Promise<User> {
        const user = await this.userModel.findById(id).select("-password").exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async UpdateUser(id: string, body: UpdateUserRequest): Promise<User> {
        if (body.password) {
            throw new Error("Password cannot be updated");
        }
        const user = await this.userModel.findByIdAndUpdate({ _id: id }, body, { new: true });
        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }
        return user;
    }

    async DeleteUser(id: string): Promise<string> {
        const user = await this.userModel.findByIdAndDelete(id);
        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }
        return `Delete user [${user.email}] success`;
    }
}