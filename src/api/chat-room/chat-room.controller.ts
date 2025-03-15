import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req } from "@nestjs/common";
import { successResponse } from "src/common/dto/response.dto";
import { CommonException } from "src/common/exception/exception";
import { ChatRoomService } from "./chat-room.service";
import { CreateChatRoomRequest, SearchChatRoomRequest, UpdateChatRoomRequest } from "src/payload/request/chat-room.request";

@Controller("chat-room")
export class ChatRoomController {
    constructor(private readonly ChatRoomervice: ChatRoomService) { }

    @Get("search")
    async Search(@Query() query: SearchChatRoomRequest, @Req() req) {
        try {
            return successResponse(await this.ChatRoomervice.Search(query, req.user));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Get(":id")
    async GetChatRoom(@Param('id') id: string, @Req() req) {
        try {
            return successResponse(await this.ChatRoomervice.GetChatRoom(id, req.user));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Post()
    async CreateChatRoom(@Body() body: CreateChatRoomRequest, @Req() req) {
        try {
            return successResponse(await this.ChatRoomervice.CreateChatRoom(body, req.user));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            ) 
        }
    }

    @Put(":id")
    async UpdateChatRoom(@Param('id') id: string, @Body() body: UpdateChatRoomRequest) {
        try {
            return successResponse(await this.ChatRoomervice.UpdateChatRoom(id, body));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            ) 
        }
    }

    @Delete()
    async DeleteChatRoom(@Query("id") id: string) {
        try {
            return successResponse(await this.ChatRoomervice.DeleteChatRoom(id));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            ) 
        }
    }
}