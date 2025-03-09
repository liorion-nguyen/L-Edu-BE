import { HttpStatus } from "@nestjs/common";
export const successResponse = <T>(data?: T): IResponse<T> => {
    return {
        statusCode: HttpStatus.OK,
        message: "sussess",
        data,
    };
};

export interface IResponse<T> {
    statusCode: HttpStatus;
    message: string;
    data: T;
}