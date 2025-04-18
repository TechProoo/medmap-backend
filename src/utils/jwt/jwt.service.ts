import jwt, { type SignOptions } from "jsonwebtoken";
import { configService } from "../config/config.service";
import { ENV } from "../../constants/env.enum";
export class JWTService {
  signPayload(payload: { [key: string]: any }, expiresIn: any = "10h"): string {
    const secret = configService.get<string>(ENV.JWT_SECRET_KEY)!;
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, secret, options);
  }
  verifyToken(token: string): { [key: string]: any } {
    const secret = configService.get<string>(ENV.JWT_SECRET_KEY)!;
    return jwt.verify(token, secret) as { [key: string]: any };
  }
}
