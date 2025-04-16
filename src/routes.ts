import { Router } from "express";
import { HomeController } from "./models/home/home.controller";
// import webhookTransactionService from "./utils/webhook";
const router = Router();

router.get("/", HomeController.welcome);

export default router;
