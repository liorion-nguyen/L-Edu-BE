import { HttpException, HttpStatus } from "@nestjs/common";

export class CommonException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}