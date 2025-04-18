import { BcryptService } from "../../utils/bcrypt/bcrypt.service";
import { JWTService } from "../../utils/jwt/jwt.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { userService } from "../user/user.service";
import { LoggerService } from "../../utils/logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";
import { UnauthorizedException } from "../../utils/exceptions/unauthorized.exception";
import { User } from "@prisma/client";

export class AuthService {
  private bcryptService: BcryptService;
  private jwtService: JWTService;

  constructor(private readonly logger: LoggerService) {
    this.bcryptService = new BcryptService();
    this.jwtService = new JWTService();
  }

  private generateAuthResponse(user: User) {
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

  async signup(data: SignupDto) {
    const hashedPassword = await this.bcryptService.hashPassword(data.password);

    const user = await userService.createUser({
      ...data,
      password: hashedPassword,
    });

    return this.generateAuthResponse(user);
  }

  async login(data: LoginDto) {
    const user = await userService.getUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await this.bcryptService.comparePassword(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.generateAuthResponse(user);
  }
}

const loggerService = new LoggerService(LoggerPaths.AUTH);
export const authService = new AuthService(loggerService);
