import { Router } from "express";
import { HomeController } from "./models/home/home.controller";
import userRouter from "./models/user/user.route";
const router = Router();

router.get("/", HomeController.welcome);

router.use("/user", userRouter);

export default router;
