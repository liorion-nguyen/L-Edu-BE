import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req } from "@nestjs/common";
import { successResponse } from "src/common/dto/response.dto";
import { CommonException } from "src/common/exception/exception";
import { SkipAuth } from "src/config/skip.auth";
import { CoursesService } from "./courses.service";
import { CreateCourseRequest, SearchCourseRequest, UpdateCourseRequest } from "src/payload/request/courses.request";

@Controller("courses")
export class CoursesController {
    constructor(private readonly courseService: CoursesService) { }

    @Get("search")
    async Search(@Query() query: SearchCourseRequest, @Req() req) {
        try {
            return successResponse(await this.courseService.Search(query, req.user));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Get(":id")
    async GetCourse(@Param('id') id: string, @Req() req) {
        try {
            return successResponse(await this.courseService.GetCourse(id, req.user.role));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Post()
    async CreateCourse(@Body() body: CreateCourseRequest) {
        try {
            return successResponse(await this.courseService.CreateCourse(body));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            ) 
        }
    }

    @Put(":id")
    async UpdateCourse(@Param('id') id: string, @Body() body: UpdateCourseRequest) {
        try {
            return successResponse(await this.courseService.UpdateCourse(id, body));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            ) 
        }
    }

    @Delete()
    async DeleteCourse(@Query("id") id: string) {
        try {
            return successResponse(await this.courseService.DeleteCourse(id));
        } catch (error) {
            throw new CommonException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            ) 
        }
    }
}