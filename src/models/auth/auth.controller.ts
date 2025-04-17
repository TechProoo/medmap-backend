import { Request, Response, NextFunction, RequestHandler } from "express";
import { authService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { ResponseDto } from "../../globalDto/response.dto";

export class AuthController {
  signup: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const signupData = req.body as SignupDto;
      const result = await authService.signup(signupData);

      const responseObj = ResponseDto.createSuccessResponse(
        "User registered successfully",
        result
      );

      res.status(201).json(responseObj);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
