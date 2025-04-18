import { BaseException } from "./base.exception";

export class UnauthorizedException extends BaseException {
  constructor(message: string, cause?: any) {
    super(message, cause || "Unauthorized");
    this.status = 401;
  }
}
