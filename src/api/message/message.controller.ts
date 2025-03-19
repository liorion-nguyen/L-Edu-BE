import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { successResponse } from "src/common/dto/response.dto";
import { CommonException } from "src/common/exception/exception";
import { MessageService } from "./message.service";
import { CreateMessageRequest, SearchMessageRequest, UpdateMessageRequest } from "src/payload/request/message.request";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("message")
export class MessageController {
    constructor(private readonly messageService: MessageService) { }

    @Get("search")
    async Search(@Query() query: SearchMessageRequest, @Req() req) {
        try {
            return successResponse(await this.messageService.Search(query, req.user));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Get(":id")
    async GetMessage(@Param('id') id: string) {
        try {
            return successResponse(await this.messageService.GetMessage(id));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Post()
    @UseInterceptors(FileInterceptor('file', { limits: {} }))
    async CreateMessage(
        @Body() body: CreateMessageRequest,
        @Req() req,
        @UploadedFile() file?: Express.Multer.File 
    ) {
        try {
            return successResponse(await this.messageService.CreateMessage(body, file, req.user));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Put(":id")
    async UpdateMessage(@Param('id') id: string, @Body() body: UpdateMessageRequest) {
        try {
            return successResponse(await this.messageService.UpdateMessage(id, body));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Delete()
    async DeleteMessage(@Query("id") id: string) {
        try {
            return successResponse(await this.messageService.DeleteMessage(id));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}