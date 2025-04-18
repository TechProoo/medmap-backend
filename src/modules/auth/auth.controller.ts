import { Request, Response, NextFunction, RequestHandler } from "express";
import { authService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { ResponseDto } from "../../globalDto/response.dto";
import { PharmacySignupDto } from "./dto/pharmacy-signup.dto";
import { HttpStatus } from "../../constants/http-status";

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

  login: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loginData = req.body as LoginDto;
      const result = await authService.login(loginData);

      const responseObj = ResponseDto.createSuccessResponse(
        "Login successful",
        result
      );

      res.status(200).json(responseObj);
    } catch (error) {
      next(error);
    }
  };

  pharmacySignup: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const pharmacyData = req.body as PharmacySignupDto;
      const result = await authService.pharmacySignup(pharmacyData);

      const responseObj = ResponseDto.createSuccessResponse(
        "Pharmacy created successfully",
        result
      );

      res.status(HttpStatus.CREATED).json(responseObj);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
