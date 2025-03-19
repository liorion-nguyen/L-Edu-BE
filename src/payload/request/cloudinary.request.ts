import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteFileType {
    @ApiProperty({
        example: "https://res.cloudinary.com/dubmd1vq9/image/upload/v1742369799/g4ebttg3taank3r6dhre.png",
        description: "URL của file cần xóa",
    })
    @IsString()
    @IsNotEmpty()
    url: string;
}