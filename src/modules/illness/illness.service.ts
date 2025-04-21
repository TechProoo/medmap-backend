import { IllnessRepository } from "./illness.repository";
import { CreateIllnessDto } from "./dto/create-illness.dto";
import { NotFoundException } from "../../utils/exceptions/not-found.exception";
import { InvalidRequestBodyException } from "../../utils/exceptions/invalid-request-body.exception";

export class IllnessService {
  private readonly repository: IllnessRepository;

  constructor() {
    this.repository = new IllnessRepository();
  }

  async createIllness(data: CreateIllnessDto) {
    // Check if illness with same name exists
    const existing = await this.repository.getIllnessByName(data.name);
    if (existing) {
      throw new InvalidRequestBodyException(
        "Illness with this name already exists"
      );
    }

    return this.repository.createIllness(data);
  }

  async getAllIllnesses() {
    return this.repository.getAllIllnesses();
  }

  async getIllnessById(id: string) {
    const illness = await this.repository.getIllnessById(id);
    if (!illness) {
      throw new NotFoundException("Illness not found");
    }
    return illness;
  }

  async updateIllness(id: string, data: Partial<CreateIllnessDto>) {
    // First verify illness exists
    await this.getIllnessById(id);

    // If name is being updated, check it's not taken
    if (data.name) {
      const existing = await this.repository.getIllnessByName(data.name);
      if (existing && existing.id !== id) {
        throw new InvalidRequestBodyException(
          "Illness with this name already exists"
        );
      }
    }

    return this.repository.updateIllness(id, data);
  }

  async deleteIllness(id: string) {
    // First verify illness exists
    await this.getIllnessById(id);

    return this.repository.deleteIllness(id);
  }

  async linkDrugToIllness(illnessId: string, drugId: string) {
    // Verify illness exists
    await this.getIllnessById(illnessId);

    try {
      await this.repository.linkDrugToIllness(illnessId, drugId);
    } catch (error) {
      if (error.code === "P2002") {
        throw new InvalidRequestBodyException(
          "This drug is already linked to this illness"
        );
      }
      throw error;
    }
  }

  async unlinkDrugFromIllness(illnessId: string, drugId: string) {
    // Verify illness exists
    await this.getIllnessById(illnessId);

    try {
      await this.repository.unlinkDrugFromIllness(illnessId, drugId);
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException("Drug is not linked to this illness");
      }
      throw error;
    }
  }
}

export const illnessService = new IllnessService();
