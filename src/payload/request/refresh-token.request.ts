import { IsString } from "class-validator";

export class RefreshTokenRequest {
  @IsString()
  refresh_token: string;
}
