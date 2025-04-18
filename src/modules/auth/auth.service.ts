import { BcryptService } from "../../utils/bcrypt/bcrypt.service";
import { JWTService } from "../../utils/jwt/jwt.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { userService } from "../user/user.service";
import { LoggerService } from "../../utils/logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";
import { UnauthorizedException } from "../../utils/exceptions/unauthorized.exception";
import { User } from "@prisma/client";
import { PharmacyRepository } from "../pharmacy/pharmacy.repository";
import { InvalidAccountException } from "../../utils/exceptions/invalid-account.exception";
import { PharmacySignupDto } from "./dto/pharmacy-signup.dto";

export class AuthService {
  private readonly pharmacyRepository: PharmacyRepository;
  private bcryptService: BcryptService;
  private jwtService: JWTService;

  constructor(private readonly logger: LoggerService) {
    this.pharmacyRepository = new PharmacyRepository();
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
    const user = await userService.findByEmail(data.email);
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

  async pharmacySignup(pharmacyData: PharmacySignupDto) {
    // Check if pharmacy with email already exists
    const existingPharmacy = await this.pharmacyRepository.getPharmacyByEmail(
      pharmacyData.email
    );

    if (existingPharmacy) {
      throw new InvalidAccountException(
        "Pharmacy with this email already exists"
      );
    }

    // Hash password
    const hashedPassword = await this.bcryptService.hashPassword(
      pharmacyData.password
    );

    // Create pharmacy with hashed password
    const pharmacy = await this.pharmacyRepository.createPharmacy({
      ...pharmacyData,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = this.jwtService.signPayload({
      id: pharmacy.id,
      type: "pharmacy",
    });

    return {
      pharmacy,
      token,
    };
  }
}

const loggerService = new LoggerService(LoggerPaths.AUTH);
export const authService = new AuthService(loggerService);
