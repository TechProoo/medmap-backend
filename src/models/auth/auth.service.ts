import { BcryptService } from "../../utils/bcrypt/bcrypt.service";
import { JWTService } from "../../utils/jwt/jwt.service";
import { SignupDto } from "./dto/signup.dto";
import { userService } from "../user/user.service";
import { LoggerService } from "../../utils/logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";

export class AuthService {
  private bcryptService: BcryptService;
  private jwtService: JWTService;

  constructor(private readonly logger: LoggerService) {
    this.bcryptService = new BcryptService();
    this.jwtService = new JWTService();
  }

  async signup(data: SignupDto) {
    const hashedPassword = await this.bcryptService.hashPassword(data.password);

    const user = await userService.createUser({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: hashedPassword,
    });

    const token = this.jwtService.signPayload({ id: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      },
      token,
    };
  }
}

const loggerService = new LoggerService(LoggerPaths.AUTH);
export const authService = new AuthService(loggerService);
