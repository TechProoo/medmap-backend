import { Router } from "express";
import { PharmacyController } from "./pharmacy.controller";
import { pharmacyAuthGuard } from "../../utils/middleware/guard/pharmacy.auth.guard";
import { MulterMiddleware } from "../../utils/middleware/file-parser.middleware";
import { LoggerService } from "../../utils/logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";

const pharmacyRouter = Router();
const logger = new LoggerService(LoggerPaths.APP);
const fileUpload = new MulterMiddleware(logger);

// Protected routes
pharmacyRouter.use(pharmacyAuthGuard.authorise());

pharmacyRouter.patch(
  "/:id",
  fileUpload.single("logo", true), // logo is optional
  fileUpload.single("shop", true), // shop image is optional
  PharmacyController.updatePharmacyDetails
);

export default pharmacyRouter;
