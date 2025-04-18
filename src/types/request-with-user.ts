import { Request } from "express";
declare global {
  namespace Express {
    interface Request {
      user?: import("@prisma/client").User;
    }
  }
}
