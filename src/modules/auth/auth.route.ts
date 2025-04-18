import { Router } from "express";
import { authController } from "./auth.controller";
import { Validator } from "../../utils/middleware/validator.middleware";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { PharmacySignupDto } from "./dto/pharmacy-signup.dto";

const authRouter = Router();
const validator = new Validator();

authRouter.post(
  "/user/signup",
  validator.single(SignupDto),
  authController.signup
);
authRouter.post(
  "/user/login",
  validator.single(LoginDto),
  authController.login
);
authRouter.post(
  "/pharmacy/signup",
  validator.single(PharmacySignupDto),
  authController.pharmacySignup
);
authRouter.post(
  "/pharmacy/login",
  validator.single(LoginDto),
  authController.pharmacyLogin
);

export default authRouter;
