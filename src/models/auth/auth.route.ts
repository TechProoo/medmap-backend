import { Router } from "express";
import { authController } from "./auth.controller";
import { Validator } from "../../utils/middleware/validator.middleware";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";

const authRouter = Router();
const validator = new Validator();

authRouter.post("/signup", validator.single(SignupDto), authController.signup);
authRouter.post("/login", validator.single(LoginDto), authController.login);

export default authRouter;
