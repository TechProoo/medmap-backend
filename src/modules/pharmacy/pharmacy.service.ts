import { PharmacyRepository } from "./pharmacy.repository";
import { v2 as cloudinary } from "cloudinary";
import { ConfigService } from "../../utils/config/config.service";
import { ENV } from "../../constants/env.enum";
import { InvalidRequestBodyException } from "../../utils/exceptions/invalid-request-body.exception";
import { NotFoundException } from "../../utils/exceptions/not-found.exception";

export class PharmacyService {
  private readonly repository: PharmacyRepository;

  constructor() {
    this.repository = new PharmacyRepository();
    // Configure cloudinary
    cloudinary.config({
      cloud_name: ConfigService.getInstance().get(ENV.CLOUDINARY_CLOUD_NAME),
      api_key: ConfigService.getInstance().get(ENV.CLOUDINARY_API_KEY),
      api_secret: ConfigService.getInstance().get(ENV.CLOUDINARY_API_SECRET),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    type: "logo" | "shop"
  ): Promise<string> {
    if (!file) {
      throw new InvalidRequestBodyException("Image file is required");
    }

    try {
      // Convert the buffer to base64
      const base64Image = file.buffer.toString("base64");
      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${base64Image}`,
        {
          folder: `medmap/${type}s`, // logos or shops folder
        }
      );

      return uploadResult.secure_url;
    } catch (error) {
      throw new InvalidRequestBodyException("Failed to upload image");
    }
  }

  async getPharmacyById(id: string) {
    const pharmacy = await this.repository.getPharmacyById(id);
    if (!pharmacy) {
      throw new NotFoundException("Pharmacy not found");
    }
    return pharmacy;
  }

  async updatePharmacyDetails(
    id: string,
    data: {
      name?: string;
      description?: string;
      logoImage?: Express.Multer.File;
      shopImage?: Express.Multer.File;
      contactInfo?: {
        address: string;
        phone: string;
        state: string;
        country: string;
        longitude: number;
        latitude: number;
      };
    }
  ) {
    const pharmacy = await this.getPharmacyById(id);

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.contactInfo) updateData.contactInfo = data.contactInfo;

    // Handle logo upload
    if (data.logoImage) {
      updateData.logoUrl = await this.uploadImage(data.logoImage, "logo");
    }

    // Handle shop image upload
    if (data.shopImage) {
      updateData.shopImageUrl = await this.uploadImage(data.shopImage, "shop");
    }

    return this.repository.updatePharmacy(pharmacy.id, updateData);
  }
}

export const pharmacyService = new PharmacyService();
