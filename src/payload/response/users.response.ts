import { IsString } from "class-validator";

export class LoginResponse {
    @IsString()
    access_token: string;

    @IsString()
    refresh_token: string;
}
export class UserCoreResponse {
    @IsString()
    _id: string;

    @IsString()
    avatar?: string;

    @IsString()
    fullName: string;
}