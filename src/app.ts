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
import { Server as SocketIOServer } from "socket.io";
import { startChat } from "./medAi/agent";

const app = express();
app.set("port", AppEnum.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet(AppEnum.HELMET_OPTIONS));
app.use(cors(AppEnum.CORS_OPTIONS));

export const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Change to your frontend URL if you want to restrict CORS
    methods: ["GET", "POST"],
  },
});

// Set up socket.io connections
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  // Handle AI messages
  socket.on("user-message", async ({ message, context }) => {
    try {
      const botReply = await startChat(message, context);
      socket.emit("bot-message", { message: botReply });
    } catch (error) {
      console.error("💥 Chat error:", error);
      socket.emit("bot-message", {
        message: "Something went wrong. Try again.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// declaring routes
app.use("/", router);

const logger = new LoggerService(LoggerPaths.APP);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(HomeController.notFound);

// Global Error Handler
app.use(errorHandler);
export default app;
