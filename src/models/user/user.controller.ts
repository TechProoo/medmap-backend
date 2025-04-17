import { Request, Response } from "express";
import { NextFunction, RequestHandler } from "express";
import { userService } from "./user.service";
import { ResponseDto } from "../../globalDto/response.dto";
export class UserController {
  getProfile: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const user = await userService.getUserById(userId);
      let responseObj = ResponseDto.createSuccessResponse(
        "User profile fetched successfully",
        user
      );
      res.status(200).json(responseObj);
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
