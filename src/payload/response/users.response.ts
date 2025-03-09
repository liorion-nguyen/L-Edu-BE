import { IsString } from "class-validator";

export class LoginResponse {
    @IsString()
    access_token: string;

    @IsString()
    refresh_token: string;
}