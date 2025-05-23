import { UseInterceptors } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMessageRequest {
    @ApiProperty({ example: 'chatroom1', description: 'Chat Room ID' })
    @IsString()
    @IsNotEmpty()
    chatRoomId: string;

    @ApiProperty({ example: 'Hello, how are you?', description: 'Message Content' })
    @IsString()
    @IsOptional()
    message?: string;

    @ApiProperty({ example: 'File ABC.png', description: 'File attachment' })
    @IsOptional()
    file?: Express.Multer.File;
}

export class UpdateMessageRequest extends PartialType(CreateMessageRequest) { }

export class SearchMessageRequest {
    @ApiProperty({ example: 1, description: "Số trang" })
    @IsString()
    @IsNotEmpty()
    page: number;

    @ApiProperty({ example: 6, description: "Số lượng" })
    @IsString()
    @IsNotEmpty()
    limit: number;

    @ApiProperty({ example: "321321321321", description: "Id chat room" })
    @IsString()
    @IsNotEmpty()
    chatRoomId: string;

    @ApiPropertyOptional({ example: "Hello", description: "Nội dung tin nhắn" })
    @IsOptional()
    @IsString()
    message?: string;

    @ApiPropertyOptional({ example: "131323123213", description: "ID Người nhắn tin" })
    @IsOptional()
    @IsString()
    senderId?: string;
}