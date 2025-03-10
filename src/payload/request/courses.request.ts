import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { 
    IsArray,
    IsEnum, 
    IsNotEmpty, 
    IsNumber, 
    IsOptional, 
    IsString, 
    ValidateNested 
} from "class-validator";
import { Currency, Status, TypeDiscount } from "src/enums/course.enum";

class DiscountRequest {
    @ApiProperty({ example: "PERCENT", description: "Loại giảm giá", enum: TypeDiscount })
    @IsEnum(TypeDiscount)
    type: TypeDiscount;

    @ApiProperty({ example: 10, description: "Số lượng giảm giá" })
    @IsNumber()
    number: number;
}

class PriceRequest {
    @ApiProperty({ example: "VND", description: "Đơn vị tiền tệ", enum: Currency })
    @IsEnum(Currency)
    currency: Currency;

    @ApiProperty({ example: 1000000, description: "Giá tiền" })
    @IsNumber()
    number: number;
}

export class CreateCourseRequest {
    @ApiProperty({ example: "Lập trình Node.js", description: "Tên khóa học" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: "Khóa học giúp bạn hiểu về Node.js", description: "Mô tả khóa học" })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ type: PriceRequest, description: "Giá khóa học" })
    @ValidateNested()
    @Type(() => PriceRequest)
    price: PriceRequest;

    @ApiPropertyOptional({ type: DiscountRequest, description: "Thông tin giảm giá (nếu có)" })
    @IsOptional()
    @ValidateNested()
    @Type(() => DiscountRequest)
    discount?: DiscountRequest;

    @ApiProperty({ example: "65234b6d1d4a3c001f8a8b1f", description: "ID giảng viên" })
    @IsString()
    @IsOptional()
    instructorId?: string;

    @ApiProperty({ example: "65234b6d1d4a3c001f8a8b20", description: "ID danh mục khóa học" })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({ example: "https://example.com/image.jpg", description: "Ảnh bìa khóa học" })
    @IsString()
    @IsOptional()
    cover?: string;

    @ApiPropertyOptional({ example: ["65234b6d1d4a3c001f8a8b30"], description: "Danh sách ID học viên" })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    students?: string[];

    @ApiPropertyOptional({ example: ["65234b6d1d4a3c001f8a8b40"], description: "Danh sách ID buổi học" })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sessions?: string[];

    @ApiProperty({ example: 30, description: "Thời lượng khóa học (số giờ)" })
    @IsNumber()
    duration: number;

    @ApiPropertyOptional({ example: "ACTIVE", description: "Trạng thái khóa học", enum: Status })
    @IsOptional()
    @IsEnum(Status)
    status?: Status;
}

export class UpdateCourseRequest extends PartialType(CreateCourseRequest) { }

export class SearchCourseRequest {
    @ApiProperty({ example: 1, description: "Số trang" })
    @IsString()
    @IsNotEmpty()
    page: number;

    @ApiProperty({ example: 6, description: "Số lượng" })
    @IsString()
    @IsNotEmpty()
    limit: number;

    @ApiPropertyOptional({ example: "Lập trình Node.js", description: "Tên khóa học" })
    @IsOptional()
    @IsString()
    name?: string;

    // @ApiPropertyOptional({ example: "100000", description: "Giá tiền khoá học" })
    // @IsOptional()
    // @IsString()
    // price?: string;
}