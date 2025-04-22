import { v2 as cloudinary } from "cloudinary";
import { ConfigService } from "../../utils/config/config.service";
import { ENV } from "../../constants/env.enum";
import { InvalidRequestBodyException } from "../../utils/exceptions/invalid-request-body.exception";
import { NotFoundException } from "../../utils/exceptions/not-found.exception";
import { DrugRepository } from "./drug.repository";
import { CreateDrugDto } from "./dto/create-drug.dto";
import { SearchDrugsDto } from "./dto/search-drugs.dto";

export class DrugService {
  private readonly repository: DrugRepository;

  constructor() {
    this.repository = new DrugRepository();
    // Configure cloudinary
    cloudinary.config({
      cloud_name: ConfigService.getInstance().get(ENV.CLOUDINARY_CLOUD_NAME),
      api_key: ConfigService.getInstance().get(ENV.CLOUDINARY_API_KEY),
      api_secret: ConfigService.getInstance().get(ENV.CLOUDINARY_API_SECRET),
    });
  }

  private async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new InvalidRequestBodyException("Valid image file is required");
    }

    try {
      // If the file already has a path (URL), it means it was uploaded by multer-storage-cloudinary
      if (file.path) {
        return file.path;
      }

      // Otherwise, handle buffer-based upload
      if (!file.buffer) {
        throw new InvalidRequestBodyException("Invalid image file format");
      }

      // Convert the buffer to base64
      const base64Image = file.buffer.toString("base64");
      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${base64Image}`,
        {
          folder: "medmap/drugs",
        }
      );

      return uploadResult.secure_url;
    } catch (error) {
      console.log("Cloudinary upload error:", error);
      throw new InvalidRequestBodyException(
        "Failed to upload drug image",
        error.message
      );
    }
  }

  async createDrug(
    pharmacyId: string,
    data: CreateDrugDto,
    image?: Express.Multer.File
  ) {
    let imageUrl: string | undefined;

    if (image) {
      imageUrl = await this.uploadImage(image);
    }

    return this.repository.createDrug({
      ...data,
      pharmacyId,
      imageUrl,
    });
  }

  async searchDrugs(params: SearchDrugsDto) {
    const { page = 1, limit = 10, ...filters } = params;
    const skip = (page - 1) * limit;

    const result = await this.repository.searchDrugs({
      skip,
      take: Number(limit),
      ...filters,
    });

    return {
      data: result.drugs,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getAllDrugs(filters?: {
    illnessId?: string;
    minStocks?: number;
    maxStocks?: number;
    minPrice?: number;
    maxPrice?: number;
  }) {
    return this.repository.getAllDrugs(filters);
  }

  async getDrugById(id: string) {
    const drug = await this.repository.getDrugById(id);
    if (!drug) {
      throw new NotFoundException("Drug not found");
    }
    return drug;
  }

  async updateDrug(
    id: string,
    pharmacyId: string,
    data: Partial<CreateDrugDto>,
    image?: Express.Multer.File
  ) {
    const drug = await this.getDrugById(id);

    // Verify that the drug belongs to the pharmacy
    if (drug.pharmacyId !== pharmacyId) {
      throw new InvalidRequestBodyException(
        "You can only update your own drugs"
      );
    }

    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await this.uploadImage(image);
    }

    return this.repository.updateDrug(id, {
      ...data,
      ...(imageUrl && { imageUrl }),
    });
  }

  async deleteDrug(id: string) {
    // First verify drug exists
    await this.getDrugById(id);

    return this.repository.deleteDrug(id);
  }

  async getMyDrugs(pharmacyId: string) {
    return this.repository.getDrugsByPharmacyId(pharmacyId);
  }
}

export const drugService = new DrugService();
