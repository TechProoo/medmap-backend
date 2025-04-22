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

// Create Express app
const app = express();
app.set("port", AppEnum.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet(AppEnum.HELMET_OPTIONS));
app.use(cors(AppEnum.CORS_OPTIONS));

// Create the HTTP server using Express app
export const server = createServer(app);

// Create Socket.IO server and attach to the existing HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("user-message", async ({ message, context }) => {
    // Your existing chatbot logic can go here
    const botResponse = "Bot's response"; // Replace with actual logic
    socket.emit("bot-message", { message: botResponse });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Declaring routes
app.use("/", router);
const logger = new LoggerService(LoggerPaths.APP);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(HomeController.notFound);

// Global Error Handler
app.use(errorHandler);

// Start the server
server.listen(app.get("port"), () => {
  console.log(`Server running on http://localhost:${app.get("port")}`);
});

export default app;
