import { NextFunction, Request, RequestHandler, Response } from "express";
import { JWTService } from "../../jwt/jwt.service";
import { UnauthorizedException } from "../../exceptions/unauthorized.exception";
import { PharmacyRepository } from "../../../modules/pharmacy/pharmacy.repository";
import { NotFoundException } from "../../exceptions/not-found.exception";
import { BaseException } from "../../exceptions/base.exception";

declare global {
  namespace Express {
    interface Request {
      pharmacy?: import("@prisma/client").Pharmacy;
    }
  }
}

export class PharmacyAuthGuard {
  constructor(
    private readonly pharmacyRepository: PharmacyRepository,
    private readonly jwtService: JWTService
  ) {}

  authorise =
    (): RequestHandler =>
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const pharmacy = await this.validateRequest(
          request as unknown as {
            headers: { authorization: any };
          }
        );

        request.pharmacy = pharmacy;
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
  }): Promise<any> {
    if (!request.headers.authorization) {
      throw new UnauthorizedException("Authorization header is missing");
    }

    const auth = request.headers.authorization;
    const [scheme, token] = auth.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid authorization token supplied");
    }

    try {
      const { id, type } = this.getPayload(token);

      // Verify that the token is for a pharmacy
      if (type !== "pharmacy") {
        throw new UnauthorizedException("Invalid token type");
      }

      const pharmacy = await this.pharmacyRepository.getPharmacyById(id);

      if (!pharmacy) {
        throw new NotFoundException("Pharmacy not found");
      }

      return pharmacy;
    } catch (error) {
      if (error instanceof BaseException) {
        throw error;
      }
      throw new UnauthorizedException("Pharmacy not authorized");
    }
  }
}

// Create and export an instance with dependencies
const pharmacyAuthGuard = new PharmacyAuthGuard(
  new PharmacyRepository(),
  new JWTService()
);

export { pharmacyAuthGuard };
