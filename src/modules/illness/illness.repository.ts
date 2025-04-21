import { Illness, Prisma } from "@prisma/client";
import { databaseService } from "../../utils/database";

export class IllnessRepository {
  async createIllness(data: {
    name: string;
    description?: string;
    symptoms: string[][];
    precautions: string[];
  }): Promise<Illness> {
    return databaseService.illness.create({
      data: {
        ...data,
        symptoms: data.symptoms as unknown as Prisma.JsonValue,
      },
    });
  }

  async getAllIllnesses(): Promise<Illness[]> {
    return databaseService.illness.findMany({
      include: {
        illnessDrugs: {
          include: {
            drug: true,
          },
        },
      },
    });
  }

  async getIllnessById(id: string): Promise<Illness | null> {
    return databaseService.illness.findUnique({
      where: { id },
      include: {
        illnessDrugs: {
          include: {
            drug: true,
          },
        },
      },
    });
  }

  async getIllnessByName(name: string): Promise<Illness | null> {
    return databaseService.illness.findUnique({
      where: { name },
      include: {
        illnessDrugs: {
          include: {
            drug: true,
          },
        },
      },
    });
  }

  async updateIllness(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      symptoms: string[][];
      precautions: string[];
    }>
  ): Promise<Illness> {
    const { symptoms, ...rest } = data;
    return databaseService.illness.update({
      where: { id },
      data: {
        ...rest,
        ...(symptoms && { symptoms: symptoms as unknown as Prisma.JsonValue }),
      },
    });
  }

  async deleteIllness(id: string): Promise<Illness> {
    // First delete all illness-drug relations
    await databaseService.illnessDrug.deleteMany({
      where: { illnessId: id },
    });

    // Then delete the illness
    return databaseService.illness.delete({
      where: { id },
    });
  }

  async linkDrugToIllness(illnessId: string, drugId: string): Promise<void> {
    await databaseService.illnessDrug.create({
      data: {
        illness: { connect: { id: illnessId } },
        drug: { connect: { id: drugId } },
      },
    });
  }

  async unlinkDrugFromIllness(
    illnessId: string,
    drugId: string
  ): Promise<void> {
    await databaseService.illnessDrug.delete({
      where: {
        illnessId_drugId: {
          illnessId,
          drugId,
        },
      },
    });
  }
}
