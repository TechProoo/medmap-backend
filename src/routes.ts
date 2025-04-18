import { Router } from "express";
import { HomeController } from "./modules/home/home.controller";
import userRouter from "./modules/user/user.route";
import authRouter from "./modules/auth/auth.route";
import pharmacyRouter from "./modules/pharmacy/pharmacy.route";
import drugRouter from "./modules/drug/drug.route";

const router = Router();

router.get("/", HomeController.welcome);

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/pharmacy", pharmacyRouter);
router.use("/drugs", drugRouter);

export default router;
