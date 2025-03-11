import { IsBoolean, IsNumber, IsString } from "class-validator";

export class SessionCoreResponse {
    @IsString()
    _id: string;

    @IsNumber()
    sessionNumber: number;

    @IsString()
    title: string;

    @IsNumber()
    views: number;

    @IsString()
    modeNoteMd: string;

    @IsString()
    modeVideoUrl: string;

    @IsString()
    modeQuizId: string;

    @IsString()
    mode: string;
}