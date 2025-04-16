import { BaseException } from "./base.exception";
export class InvalidRequestBodyException extends BaseException {
  constructor(message: string, cause?: any) {
    super(message, cause || "Invalid Request Body");
    this.status = 400;
  }
}
