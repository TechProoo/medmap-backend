import { HttpStatus } from "../../constants/http-status";
import { BaseException } from "./base.exception";

export class ValidationException extends BaseException {
  readonly errors: any;
  readonly errorString?: string;
  constructor(cause: string, errorString?: string, errors?: any) {
    super(errorString || "Validation Error");
    this.status = HttpStatus.FORBIDDEN;
    this.cause = cause;
    this.errorString = errorString;
  }
}
