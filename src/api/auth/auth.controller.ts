import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { successResponse } from 'src/common/dto/response.dto';
import { CommonException } from 'src/common/exception/exception';
import { CreateUserRequest, LoginRequest } from 'src/payload/request/users.request';
import { AuthService } from './auth.service';
import { SkipAuth } from 'src/config/skip.auth';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @SkipAuth()
    @Post('login')
    async Login(@Body() loginRequest: LoginRequest) {
        try {
            return successResponse(await this.authService.Login(loginRequest));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @SkipAuth()
    @Post('signup')
    async CreateUser(@Body() body: CreateUserRequest) {
        try {
            return successResponse(await this.authService.CreateUser(body));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
