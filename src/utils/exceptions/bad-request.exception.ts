import { HttpStatus } from "../../constants/http-status";
import { BaseException } from "./base.exception";

export class BadRequestException extends BaseException {
  constructor(message: string, cause?: string) {
    super(message, cause || "Bad Request");
    this.status = HttpStatus.BAD_REQUEST;
  }
}
