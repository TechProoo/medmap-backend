import { Router } from "express";
import { IllnessController } from "./illness.controller";
import { CreateIllnessDto } from "./dto/create-illness.dto";
import { Validator } from "../../utils/middleware/validator.middleware";
const router = Router();
const validator = new Validator();
// Create an illness
router.post(
  "/",
  validator.single(CreateIllnessDto),
  IllnessController.createIllness
);

// Get all illnesses
router.get("/", IllnessController.getAllIllnesses);

// Get illness by ID
router.get("/:id", IllnessController.getIllnessById);

// Update illness
router.put("/:id", IllnessController.updateIllness);

// Delete illness
router.delete("/:id", IllnessController.deleteIllness);

// Link a drug to an illness
router.post("/:illnessId/drugs/:drugId", IllnessController.linkDrugToIllness);

// Unlink a drug from an illness
router.delete(
  "/:illnessId/drugs/:drugId",
  IllnessController.unlinkDrugFromIllness
);

export default router;
