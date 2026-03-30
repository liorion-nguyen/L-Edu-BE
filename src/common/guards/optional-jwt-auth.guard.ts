import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** Gắn req.user nếu có Bearer hợp lệ; không token / token lỗi vẫn cho qua (route public). */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers?.authorization as string | undefined;
        if (!authHeader?.startsWith("Bearer ")) {
            return true;
        }
        try {
            return (await super.canActivate(context)) as boolean;
        } catch {
            return true;
        }
    }

    handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
        if (err || !user) {
            return undefined as TUser;
        }
        return user;
    }
}
