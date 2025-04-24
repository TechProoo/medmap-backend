import { Request, Response, NextFunction } from "express";
import { drugService } from "./drug.service";
import { HttpStatus } from "../../constants/http-status";
import { ResponseDto } from "../../globalDto/response.dto";
import { CreateDrugDto } from "./dto/create-drug.dto";
import { SearchDrugsDto } from "./dto/search-drugs.dto";

export class DrugController {
  static async createDrug(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateDrugDto;
      const pharmacyId = req.pharmacy!.id;
      const image = req.file;

      const drug = await drugService.createDrug(pharmacyId, data, image);
      res
        .status(HttpStatus.CREATED)
        .json(
          ResponseDto.createSuccessResponse("Drug created successfully", drug)
        );
    } catch (error) {
      next(error);
    }
  }

  static async searchDrugs(req: Request, res: Response, next: NextFunction) {
    try {
      const searchParams = req.query as SearchDrugsDto;
      const result = await drugService.searchDrugs(searchParams);
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse(
            "Drugs retrieved successfully",
            result
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async getAllDrugs(req: Request, res: Response, next: NextFunction) {
    try {
      const { illnessId, minStocks, maxStocks, minPrice, maxPrice } = req.query;
      const drugs = await drugService.getAllDrugs({
        illnessId: illnessId as string,
        minStocks: minStocks ? Number(minStocks) : undefined,
        maxStocks: maxStocks ? Number(maxStocks) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse(
            "Drugs retrieved successfully",
            drugs
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async getDrugById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const drug = await drugService.getDrugById(id);
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse("Drug retrieved successfully", drug)
        );
    } catch (error) {
      next(error);
    }
  }

  static async updateDrug(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;
      const pharmacyId = req.pharmacy!.id;
      const image = req.file;

      const drug = await drugService.updateDrug(id, pharmacyId, data, image);
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse("Drug updated successfully", drug)
        );
    } catch (error) {
      next(error);
    }
  }

  static async deleteDrug(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const drug = await drugService.deleteDrug(id);

      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse("Drug deleted successfully", drug)
        );
    } catch (error) {
      next(error);
    }
  }

  static async getMyDrugs(req: Request, res: Response, next: NextFunction) {
    try {
      const pharmacyId = req.pharmacy!.id;
      const { page = 1, limit = 10, all = false } = req.query;
      const result = await drugService.getMyDrugs(pharmacyId, {
        page: Number(page),
        limit: Number(limit),
        all: !!all,
      });
      res
        .status(HttpStatus.OK)
        .json(
          ResponseDto.createSuccessResponse(
            "Your drugs retrieved successfully",
            result
          )
        );
    } catch (error) {
      next(error);
    }
  }
}

export const drugController = new DrugController();
