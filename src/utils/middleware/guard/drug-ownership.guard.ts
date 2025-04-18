import { NextFunction, Request, RequestHandler, Response } from "express";
import { drugService } from "../../../modules/drug/drug.service";
import { UnauthorizedException } from "../../exceptions/unauthorized.exception";

export class DrugOwnershipGuard {
  authorise =
    (paramIdField: string = "id"): RequestHandler =>
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const drugId = request.params[paramIdField];
        const pharmacyId = request.pharmacy?.id;

        if (!pharmacyId) {
          throw new UnauthorizedException("Pharmacy not authenticated");
        }

        const drug = await drugService.getDrugById(drugId);

        if (drug.pharmacyId !== pharmacyId) {
          throw new UnauthorizedException("You can only modify your own drugs");
        }

        next();
      } catch (error) {
        next(error);
      }
    };
}

export const drugOwnershipGuard = new DrugOwnershipGuard();
