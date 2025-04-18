import { Router } from "express";
import { DrugController } from "./drug.controller";
import { pharmacyAuthGuard } from "../../utils/middleware/guard/pharmacy.auth.guard";
import { drugOwnershipGuard } from "../../utils/middleware/guard/drug-ownership.guard";
import { MulterMiddleware } from "../../utils/middleware/file-parser.middleware";
import { LoggerService } from "../../utils/logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";
import { Validator } from "../../utils/middleware/validator.middleware";
import { CreateDrugDto } from "./dto/create-drug.dto";
import { SearchDrugsDto } from "./dto/search-drugs.dto";

const drugRouter = Router();
const logger = new LoggerService(LoggerPaths.APP);
const fileUpload = new MulterMiddleware(logger);
const validator = new Validator();

// Public routes
drugRouter.get(
  "/search",
  validator.single(SearchDrugsDto, "query"),
  DrugController.searchDrugs
);
drugRouter.get("/", DrugController.getAllDrugs);
drugRouter.get("/:id", DrugController.getDrugById);

// Protected routes (Pharmacy only)
drugRouter.use(pharmacyAuthGuard.authorise());

drugRouter.post(
  "/",
  fileUpload.single("image", true), // drug image is optional
  validator.single(CreateDrugDto),
  DrugController.createDrug
);

drugRouter.patch(
  "/:id",
  drugOwnershipGuard.authorise(),
  fileUpload.single("image", true), // drug image is optional
  validator.single(CreateDrugDto),
  DrugController.updateDrug
);

drugRouter.delete(
  "/:id",
  drugOwnershipGuard.authorise(),
  DrugController.deleteDrug
);

export default drugRouter;
