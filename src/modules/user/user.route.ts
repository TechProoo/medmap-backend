import { Router } from "express";
import { userController } from "./user.controller";
import { CustomerAuthGaurd } from "../../utils/middleware/guard/user.auth.guard";
import { UserService } from "./user.service";
import { JWTService } from "../../utils/jwt/jwt.service";

const userRouter = Router();
const authGuard = new CustomerAuthGaurd(
  new UserService(null),
  new JWTService()
);

userRouter.get("/profile", authGuard.authorise(), userController.getProfile);

export default userRouter;
