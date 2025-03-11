import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, UseInterceptors } from "@nestjs/common";
import { SessionService } from "./session.service";
import { CommonException } from "src/common/exception/exception";
import { CreateSessionRequest, SearchSessionRequest, UpdateSessionRequest } from "src/payload/request/session.request";
import { successResponse } from "src/common/dto/response.dto";
import { AnyFilesInterceptor } from "@nestjs/platform-express";

@Controller("session")
export class SessionController {
    constructor(
        private readonly sessionService: SessionService
    ) { }

    @Get("search")
    async Search(@Query() query: SearchSessionRequest) {
        try {
            return successResponse(await this.sessionService.Search(query));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Get(":id")
    async GetSession(@Param('id') id: string, @Req() req) {
        try {
            return successResponse(await this.sessionService.getSessionById(id, req.user.role));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Post()
    @UseInterceptors(AnyFilesInterceptor()) 
    async CreateSession(@Body() body: CreateSessionRequest) {
        try {
            return successResponse(await this.sessionService.CreateSession(body));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Put(":id")
    async UpdateSession(@Param('id') id: string, @Body() body: UpdateSessionRequest) {
        try {
            return successResponse(await this.sessionService.UpdateSession(id, body));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Delete()
    async DeleteSession(@Query("id") id: string) {
        try {
            return successResponse(await this.sessionService.DeleteSession(id));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}