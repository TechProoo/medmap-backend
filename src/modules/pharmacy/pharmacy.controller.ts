import { Request, Response, NextFunction } from "express";
import { pharmacyService } from "./pharmacy.service";
import { HttpStatus } from "../../constants/http-status";
import { ResponseDto } from "../../globalDto/response.dto";

export class PharmacyController {
  static async getAllPharmacies(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const pharmacies = await pharmacyService.getAllPharmacies();
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse(
            "Pharmacies retrieved successfully",
            pharmacies
          )
        );
    } catch (error) {
      next(error);
    }
  }
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    const pharmacy = req.pharmacy!;
    res
      .status(HttpStatus.OK)
      .json(ResponseDto.createSuccessResponse("User profile", pharmacy));
  }
  static async getPharmacyById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const pharmacy = await pharmacyService.getPharmacyById(id);
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse(
            "Pharmacy retrieved successfully",
            pharmacy
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async updatePharmacyDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { name, description, contactInfo } = req.body;
      const logoImage = req.files?.["logo"]?.[0];
      const shopImage = req.files?.["shop"]?.[0];

      const pharmacy = await pharmacyService.updatePharmacyDetails(id, {
        name,
        description,
        contactInfo,
        logoImage,
        shopImage,
      });

      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse(
            "Pharmacy details updated successfully",
            pharmacy
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
