import { Body, Controller, Get, HttpStatus, Post, Query, Req } from "@nestjs/common";
import { UserService } from "./users.service";
import { CreateUserRequest, SearchUserRequest } from "src/payload/request/users.request";
import { successResponse } from "src/common/dto/response.dto";
import { CommonException } from "src/common/exception/exception";
import { SkipAuth } from "src/config/skip.auth";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) { }

    @SkipAuth()
    @Get("search")
    async Search(@Query() query: SearchUserRequest) {
        try {
            return successResponse(await this.userService.Search(query));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}