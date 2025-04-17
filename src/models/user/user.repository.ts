import { Prisma } from "@prisma/client";
import { databaseService } from "../../utils/database";
import { DefaultArgs } from "@prisma/client/runtime/library";
export class UserRepository {
  private readonly userDelegate: Prisma.UserDelegate<DefaultArgs>;
  constructor() {
    this.userDelegate = databaseService.user;
  }

  async getUserById(userId: string) {
    return await this.userDelegate.findUnique({
      where: { id: userId },
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return await this.userDelegate.create({
      data,
    });
  }
}
export const userRepository = new UserRepository();
