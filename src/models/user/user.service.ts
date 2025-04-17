import { userRepository } from "./user.repository";
import { Prisma } from "@prisma/client";
import { LoggerService } from "../../utils/logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";
import { InternalServerErrorException } from "../../utils/exceptions/internal-server.exception";
export class UserService {
  constructor(private readonly logger: LoggerService) {}
  async getUserById(userId: string) {
    return await userRepository.getUserById(userId);
  }

  async createUser(data: Prisma.UserCreateInput) {
    try {
      return await userRepository.createUser(data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException("Failed to create user", error);
    }
  }
}
const loggerService = new LoggerService(LoggerPaths.USER);
export const userService = new UserService(loggerService);
