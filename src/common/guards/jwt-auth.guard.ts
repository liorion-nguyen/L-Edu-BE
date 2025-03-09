import {
    ExecutionContext,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "src/config/skip.auth";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    constructor(private reflector: Reflector) {
        super();
    }

    handleRequest(
        err: any,
        user: any,
        info: any,
        context: ExecutionContext,
        status: any
    ) {
        if (err) {
            throw new InternalServerErrorException(
                "An unexpected error occurred during authentication"
            );
        }

        if (!user) {
            const message = info?.message || "Authentication failed";
            throw new UnauthorizedException(message);
        }

        if (user && user.status === "INACTIVE") {
            throw new UnauthorizedException("User is inactive");
        }

        return user;
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }
}