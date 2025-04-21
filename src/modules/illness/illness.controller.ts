import { Request, Response, NextFunction } from "express";
import { illnessService } from "./illness.service";
import { HttpStatus } from "../../constants/http-status";
import { ResponseDto } from "../../globalDto/response.dto";
import { CreateIllnessDto } from "./dto/create-illness.dto";

export class IllnessController {
  static async createIllness(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateIllnessDto;
      const illness = await illnessService.createIllness(data);
      res
        .status(HttpStatus.CREATED)
        .json(
          ResponseDto.createSuccessResponse(
            "Illness created successfully",
            illness
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async getAllIllnesses(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const illnesses = await illnessService.getAllIllnesses();
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse(
            "Illnesses retrieved successfully",
            illnesses
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async getIllnessById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const illness = await illnessService.getIllnessById(id);
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse(
            "Illness retrieved successfully",
            illness
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async updateIllness(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;
      const illness = await illnessService.updateIllness(id, data);
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse(
            "Illness updated successfully",
            illness
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async deleteIllness(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const illness = await illnessService.deleteIllness(id);
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse(
            "Illness deleted successfully",
            illness
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async linkDrugToIllness(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { illnessId, drugId } = req.params;
      await illnessService.linkDrugToIllness(illnessId, drugId);
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse(
            "Drug linked to illness successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async unlinkDrugFromIllness(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { illnessId, drugId } = req.params;
      await illnessService.unlinkDrugFromIllness(illnessId, drugId);
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse(
            "Drug unlinked from illness successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
