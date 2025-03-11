import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req } from "@nestjs/common";
import { UserService } from "./users.service";
import { SearchUserRequest, UpdateUserRequest } from "src/payload/request/users.request";
import { successResponse } from "src/common/dto/response.dto";
import { CommonException } from "src/common/exception/exception";
import { Request } from "express";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get("search")
    async Search(@Query() query: SearchUserRequest, @Req() req) {
        try {
            return successResponse(await this.userService.Search(query));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Get("core/:role")
    async getUsersCore(@Req() req, @Param("role") role: string) {
        try {
            return successResponse(await this.userService.getUsersCore(req.user.role, role));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Get()
    async GetUser(@Req() req) {
        try {
            return successResponse(await this.userService.GetUser(req.user._id));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Put(":id")
    async UpdateUser(@Param("id") id: string, @Body() body: UpdateUserRequest) {
        try {
            return successResponse(await this.userService.UpdateUser(id, body));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Delete(":id")
    async DeleteUser(@Param("id") id: string) {
        try {
            return successResponse(await this.userService.DeleteUser(id));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}