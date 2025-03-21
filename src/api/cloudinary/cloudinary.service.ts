import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { TypeFile } from 'src/enums/message.enum';
import streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    async uploadFile(file: Express.Multer.File): Promise<{ secure_url: string; type: TypeFile }> {
        console.log(file);
    
        return new Promise((resolve, reject) => {
            const resourceType = this.getResourceType(file.mimetype);
    
            const fileName = file.originalname.split('.').slice(0, -1).join('.') || 'unknown'; // Lấy tên file gốc (không bao gồm phần mở rộng)
            const fileExtension = file.originalname.split('.').pop()?.toLowerCase() || ''; // Lấy phần mở rộng file (ví dụ: ts, js)
    
            const publicId = `${fileName}_${Date.now()}`; // Đảm bảo tên file là duy nhất bằng cách thêm timestamp
    
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: resourceType,
                    public_id: publicId, // Sử dụng tên file tùy chỉnh
                    format: fileExtension, // Đặt định dạng file nếu có
                },
                (error, result) => {
                    if (error) return reject(error);
    
                    // Lấy định dạng file từ Cloudinary hoặc suy luận từ tên file
                    let fileFormat = result?.format ? result.format.toLowerCase() : '';
                    if (!fileFormat) {
                        const mimeType = file.mimetype; // Ví dụ: 'text/html'
                        fileFormat = mimeType.split('/')[1]?.toLowerCase() || '';
                    }
                    if (!fileFormat) {
                        fileFormat = fileExtension || 'unknown';
                    }
    
                    // Xác định loại file
                    let type: TypeFile;
                    if (resourceType === 'image') {
                        type = TypeFile.IMAGE;
                    } else if (resourceType === 'video') {
                        type = TypeFile.VIDEO;
                    } else {
                        type = TypeFile.FILE;
                    }
    
                    resolve({ secure_url: result.secure_url, type });
                }
            );
    
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
    
    

    async deleteFileByUrl(url: string): Promise<{ result: string }> {
        const { publicId, resourceType } = this.extractPublicIdAndType(url);
        if (!publicId) throw new Error('Invalid Cloudinary URL');

        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    }

    private getResourceType(mimeType: string): 'image' | 'video' | 'raw' {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        return 'raw'; // Các file như pdf, docx, csv, txt...
    }

    private extractPublicIdAndType(url: string): { publicId: string | null; resourceType: 'image' | 'video' | 'raw' } {
        let resourceType: 'image' | 'video' | 'raw' = 'image';

        if (url.includes('/video/upload/')) {
            resourceType = 'video';
        } else if (url.includes('/raw/upload/')) {
            resourceType = 'raw';
        }

        const match = url.match(/\/v\d+\/(.+?)(\.\w+)?$/);
        return { publicId: match ? match[1] : null, resourceType };
    }
}
