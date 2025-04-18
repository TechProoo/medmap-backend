import { userRepository } from "./user.repository";
import { Prisma } from "@prisma/client";
import { LoggerService } from "../../utils/logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";
import { InternalServerException } from "../../utils/exceptions/internal-server.exception";
import { BadRequestException } from "../../utils/exceptions/bad-request.exception";
export class UserService {
  constructor(private readonly logger: LoggerService) {}
  async findOne(userId: string) {
    return await userRepository.getUserById(userId);
  }

  async findByEmail(email: string) {
    return await userRepository.getUserByEmail(email);
  }

  async createUser(data: Prisma.UserCreateInput) {
    try {
      let existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new BadRequestException("User already exists");
      }
      return await userRepository.createUser(data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerException("Failed to create user", error);
    }
  }
}
const loggerService = new LoggerService(LoggerPaths.USER);
export const userService = new UserService(loggerService);
