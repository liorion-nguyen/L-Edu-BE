import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { Gender, Role, Status } from "src/enums/user.enum";

export class Address {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({  example: '973', description: 'Tỉnh/Thành phố' })
    province: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '96', description: 'Quận/Huyện' })
    district: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '32236', description: 'Xã/Phường' })
    ward: string;
}

export class Phone {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '+ 84', description: 'Mã quốc gia' })
    country: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '123456789', description: 'Số điện thoại' })
    number: string;
}

export class CreateUserRequest {
    @IsString()
    @Length(6, 32)
    @IsNotEmpty()
    @ApiProperty({ example: 'abc123', description: 'Mật khẩu' })
    password: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'abc123@gmail.com', description: 'Email' })
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Nguyen Van A', description: 'Họ và tên' })
    fullName: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'https://www.google.com', description: 'Ảnh đại diện' })
    avatar?: string;

    @IsOptional()
    @ApiPropertyOptional({ type: Address, description: 'Địa chỉ' })
    address?: Address;
    
    @IsOptional()
    @ApiPropertyOptional({ type: Phone, description: 'Số điện thoại' })
    phone?: Phone;

    @IsOptional()
    @ApiPropertyOptional({ example: 'STUDENT', description: 'Vai trò' })
    role?: Role;

    @IsOptional()
    @ApiPropertyOptional({ example: "MALE", description: 'Giới tính' })
    gender?: Gender;

    @IsOptional()
    @IsDateString()
    @ApiPropertyOptional({ example: '2021-01-01', description: 'Ngày sinh' })
    birthday?: Date;

    @IsOptional()
    @ApiPropertyOptional({ example: 'ACTIVE', description: 'Trạng thái' })
    status?: Status;
}

export class UpdateUserRequest extends PartialType(CreateUserRequest) {
}

export class SearchUserRequest {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '1', description: 'Số trang' })
    page: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '6', description: 'Số lượng' })
    limit: number;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'abc@gmail.com', description: 'Email' })
    email?: string;

    @IsString() 
    @IsOptional()
    @ApiPropertyOptional({ example: 'Nguyen Van A', description: 'Họ và tên' })
    fullName?: string;
}

export class ChangePasswordRequest {
    @IsString()
    @Length(6, 32)
    @IsNotEmpty()
    @ApiProperty({ example: 'abc123', description: 'Mật khẩu cũ' })
    oldPassword: string;

    @IsString()
    @Length(6, 32)
    @IsNotEmpty()
    @ApiProperty({ example: 'abc123', description: 'Mật khẩu mới' })
    newPassword: string;
}

export class LoginRequest {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'abc@gmail.com', description: 'Email' })
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'abc123', description: 'Mật khẩu' })
    password: string;
}

export class LogoutRequest {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'abc123', description: 'Mật khẩu' })
    refresh_token: string;
}