import { Router } from "express";
import { PharmacyController } from "./pharmacy.controller";
import { pharmacyAuthGuard } from "../../utils/middleware/guard/pharmacy.auth.guard";
import { MulterMiddleware } from "../../utils/middleware/file-parser.middleware";
import { LoggerService } from "../../utils/logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";

const pharmacyRouter = Router();
const logger = new LoggerService(LoggerPaths.APP);
const fileUpload = new MulterMiddleware(logger);

// Public routes
pharmacyRouter.get("/", PharmacyController.getAllPharmacies);
pharmacyRouter.get("/:id", PharmacyController.getPharmacyById);

pharmacyRouter.patch(
  "/:id",
  pharmacyAuthGuard.authorise(),
  fileUpload.single("logo", true), // logo is optional
  fileUpload.single("shop", true), // shop image is optional
  PharmacyController.updatePharmacyDetails
);

pharmacyRouter.get(
  "/profile",
  pharmacyAuthGuard.authorise(),
  PharmacyController.getProfile
);
export default pharmacyRouter;
