import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { BadRequestException } from "../exceptions/bad-request.exception";
import { configService } from "../config/config.service";
import { ENV } from "../../constants/env.enum";
import { InternalServerException } from "../exceptions/internal-server.exception";
import { LoggerService } from "../logger/logger.service";

export class MulterMiddleware {
  private upload: multer.Multer;

  constructor(private readonly logger: LoggerService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: configService.get(ENV.CLOUDINARY_CLOUD_NAME),
      api_key: configService.get(ENV.CLOUDINARY_API_KEY),
      api_secret: configService.get(ENV.CLOUDINARY_API_SECRET),
    });

    // Set up Cloudinary storage
    const storage = new CloudinaryStorage({
      cloudinary,
      params: {
        public_id: (req, file) => Date.now() + "-" + file.originalname,
      },
    });

    // Set up Multer with Cloudinary storage
    this.upload = multer({ storage });
  }

  public single(fieldName: string, optional: boolean = false) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await new Promise<void>((resolve, reject) => {
          this.upload.single(fieldName)(req, res, (err: any) => {
            if (err) {
              if (optional && err instanceof multer.MulterError) {
                return resolve();
              }
              return reject(err);
            }
            resolve();
          });
        });
        next();
      } catch (err) {
        this.logger.error("Error Uploading Image", err);
        console.log(optional, err);
        if (err instanceof multer.MulterError) {
          console.log("MulterError", err);
          if (optional) {
            return next();
          }
          next(new BadRequestException(err.message));
        }
        next(new InternalServerException("Error Uploading Image"));
      }
    };
  }

  public multiple(fieldName: string, maxCount: number) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await new Promise<void>((resolve, reject) => {
          this.upload.array(fieldName, maxCount)(req, res, (err: any) => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        });
        next();
      } catch (err) {
        this.logger.error("Error uploading images", err);
        if (err instanceof multer.MulterError) {
          next(new BadRequestException(err.message));
        }
        next(new InternalServerException("Critical Error uploading images"));
      }
    };
  }
}
