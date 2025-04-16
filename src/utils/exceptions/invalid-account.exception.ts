import { HttpStatus } from "../../constants/http-status";
import { BaseException } from "./base.exception";

export class InvalidAccountException extends BaseException {
  constructor(message: string, cause?: string) {
    super(message, cause || "Invalid Account");
    this.status = HttpStatus.BAD_REQUEST;
  }
}
