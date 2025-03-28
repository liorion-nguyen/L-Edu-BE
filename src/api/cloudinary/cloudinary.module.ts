import { Module } from "@nestjs/common";
import { CloudinaryService } from "./cloudinary.service";
import { CloudinaryController } from "./cloudinary.controller";
import { CloudinaryProvider } from "./cloudinary.config";

@Module({
    providers: [CloudinaryProvider, CloudinaryService],
    exports: [CloudinaryService], 
    controllers: [CloudinaryController],
})
export class CloudinaryModule { }