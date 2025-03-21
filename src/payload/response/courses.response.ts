import { IsString } from "class-validator";
import { Discount, Price } from "src/scheme/course.schema";
import { SessionCoreResponse } from "./session.response";
import { Status } from "src/enums/course.enum";
import { UserCoreResponse } from "./users.response";
import { Role } from "src/enums/user.enum";

export class CourseResponse {
    _id: string;

    name: string;

    description: string;

    price: Price;

    discount?: Discount;

    instructor?: UserCoreResponse | null;

    cover?: string;

    students: string[];

    sessions?: SessionCoreResponse[] | string[];

    duration: number;

    status: Status;

    mode?: string;

    instructorId?: string;
}

export class MyCourseResponse {
    _id: string;

    name: string;

    instructor: UserCoreResponse | null;

    duration: number;

    numberOfSessionCurrent: number;

    role: Role;
}