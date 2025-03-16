import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { TypeChatRoom } from "src/enums/message.enum";

export class CreateChatRoomRequest {
    @ApiProperty({ example: 'Study Group', description: 'Name of the chat room' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: ['user1', 'user2'], description: 'User IDs in the chat room' })
    @IsArray()
    @IsNotEmpty()
    membersId: string[];

    @ApiProperty({ example: 'PRIVATE', enum: TypeChatRoom, description: 'Type of the chat room' })
    @IsEnum(TypeChatRoom)
    @IsOptional()
    type?: TypeChatRoom;
}

export class UpdateChatRoomRequest extends PartialType(CreateChatRoomRequest) { }

export class SearchChatRoomRequest {
    @ApiProperty({ example: 1, description: "Số trang" })
    @IsString()
    @IsNotEmpty()
    page: number;

    @ApiProperty({ example: 6, description: "Số lượng" })
    @IsString()
    @IsNotEmpty()
    limit: number;

    @ApiPropertyOptional({ example: "Box Chat ABC", description: "Tên nhóm chat" })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: "131323123213", description: "ID người tham gia" })
    @IsOptional()
    @IsString()
    UserIdJoin?: string;
}

export class GetMsgChatRoomRequest {
    @ApiProperty({ example: 1, description: "Số trang" })
    @IsString()
    @IsNotEmpty()
    page: number;

    @ApiProperty({ example: 6, description: "Số lượng" })
    @IsString()
    @IsNotEmpty()
    limit: number;
}