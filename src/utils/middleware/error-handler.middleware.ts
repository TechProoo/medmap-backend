import { NextFunction } from "express";
import { BaseException } from "../exceptions/base.exception";
import { ResponseDto } from "../../globalDto/response.dto";
import { Response, Request } from "express";
import { LoggerService } from "../logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";

const requestErrors = new LoggerService(LoggerPaths.CLIENT);
export function errorHandler(
  error: BaseException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = error.status || 500;

  const message = error.message || "Something went wrong";
  const resObj = ResponseDto.createErrorResponse(message, {
    cause: error.cause,
    name: error.name,
    path: req.path,
    statusCode: status,
  });
  requestErrors.error(resObj.message, resObj.status);
  res.status(status).send(resObj);
  next();
}
