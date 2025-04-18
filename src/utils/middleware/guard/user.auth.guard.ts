import { NextFunction, Request, RequestHandler, Response } from "express";

import { JWTService } from "../../jwt/jwt.service";
import { User } from "@prisma/client";
import { UnauthorizedException } from "../../exceptions/unauthorized.exception";
import { UserService } from "../../../modules/user/user.service";
import { NotFoundException } from "../../exceptions/not-found.exception";
import { BaseException } from "../../exceptions/base.exception";

export class CustomerAuthGaurd {
  constructor(
    private readonly userRepository: UserService,
    private readonly jwtService: JWTService
  ) {}

  authorise =
    (): RequestHandler =>
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const user = await this.validateRequest(
          request as unknown as {
            headers: { authorization: any };
          }
        );

        request.user = user;
        next();
      } catch (error) {
        next(error);
      }
    };

  private getPayload(token: string): { [key: string]: any } {
    const payload = this.jwtService.verifyToken(token);
    return payload;
  }

  private async validateRequest(request: {
    headers: { authorization: any };
  }): Promise<User> {
    // 1. Ensure the Authorization header exists
    if (!request.headers.authorization) {
      throw new UnauthorizedException("Authorization header is missing");
    }

    const auth = request.headers.authorization;
    const [scheme, token] = auth.split(" ");

    // 2. Ensure we're using a Bearer token
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid authorization token supplied");
    }

    try {
      // 3. Verify JWT and load user
      const { id } = this.getPayload(token);
      const user = await this.userRepository.findOne(id);

      if (!user) {
        throw new NotFoundException("User not found");
      }

      return user;
    } catch (error) {
      if (error instanceof BaseException) {
        throw error;
      }
      throw new UnauthorizedException("User not authorized");
    }
  }
}
