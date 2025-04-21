import express from "express";
import helmet from "helmet";
import cors from "cors";
import { AppEnum } from "./constants/app.enum";
import { errorHandler } from "./utils/middleware/error-handler.middleware";
import { HomeController } from "./modules/home/home.controller";
import router from "./routes";
import { LoggerService } from "./utils/logger/logger.service";
import { LoggerPaths } from "./constants/logger-paths.enum";
import { createServer } from "http";
import swaggerSpec from "./docs/swagger.json";
import swaggerUi from "swagger-ui-express";
import { Server } from "socket.io";

const app = express();
app.set("port", AppEnum.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet(AppEnum.HELMET_OPTIONS));
app.use(cors(AppEnum.CORS_OPTIONS));

export const server = createServer(app);
const io = new Server(server);

// declaring routes
app.use("/", router);
const logger = new LoggerService(LoggerPaths.APP);

let botReply = "Hello from MedAi!";
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("user-message", async ({ message }) => {
    console.log("Test1: ", message);
    socket.emit("bot-message", { message: botReply });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(HomeController.notFound);

// Global Error Handler
app.use(errorHandler);
export default app;
