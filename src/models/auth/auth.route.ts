import { Router } from "express";
import { authController } from "./auth.controller";
import { Validator } from "../../utils/middleware/validator.middleware";
import { SignupDto } from "./dto/signup.dto";

const authRouter = Router();
const validator = new Validator();

authRouter.post("/signup", validator.single(SignupDto), authController.signup);

export default authRouter;
