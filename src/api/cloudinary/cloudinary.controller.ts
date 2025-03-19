import { Controller, Post, Delete, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { DeleteFileType } from 'src/payload/request/cloudinary.request';

@Controller('upload')
export class CloudinaryController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('File is missing');
        }
        const imageData = await this.cloudinaryService.uploadFile(file);
        return imageData; 
    }

    @Delete()
    async deleteImage(@Body() body: DeleteFileType) {
        if (!body) {
            throw new Error('Image URL is required');
        }
        const result = await this.cloudinaryService.deleteFileByUrl(body.url);
        return result;
    }
}