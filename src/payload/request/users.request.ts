import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";
import { Gender, Role, Status } from "src/enums/user.enum";

export class Address {
    @IsString()
    @IsNotEmpty()
    province: string;

    @IsString()
    @IsNotEmpty()
    district: string;

    @IsString()
    @IsNotEmpty()
    ward: string;
}

export class Phone {
    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsNotEmpty()
    number: string;
}

export class CreateUserRequest {
    @IsString()
    @Length(6, 32)
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsOptional()
    address?: Address;
    
    @IsOptional()
    phone?: Phone;

    @IsOptional()
    @IsNumber()
    age?: number

    @IsOptional()
    role?: Role;

    @IsOptional()
    gender?: Gender;

    @IsOptional()
    @IsDateString()
    birthday?: Date;

    @IsOptional()
    status?: Status;
}

export class UpdateUserRequest extends CreateUserRequest {
}

export class SearchUserRequest {
    @IsNumber()
    @IsNotEmpty()
    page: number;

    @IsNumber()
    @IsNotEmpty()
    limit: number;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString() 
    @IsOptional()
    fullName?: string;
}

export class ChangePasswordRequest {
    @IsString()
    @Length(6, 32)
    @IsNotEmpty()
    oldPassword: string;

    @IsString()
    @Length(6, 32)
    @IsNotEmpty()
    newPassword: string;
}

export class LoginRequest {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class LogoutRequest {
    @IsString()
    refresh_token: string;
}