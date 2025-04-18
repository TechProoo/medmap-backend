import { Drug, Prisma } from "@prisma/client";
import { databaseService } from "../../utils/database";

export class DrugRepository {
  async createDrug(data: {
    name: string;
    description?: string;
    sideEffects: string[];
    pharmacyId: string;
    expiryDate: Date;
    imageUrl?: string;
    price: number;
    inStock: boolean;
    illnessIds: string[];
  }): Promise<Drug> {
    const { illnessIds, ...drugData } = data;
    return databaseService.drug.create({
      data: {
        ...drugData,
        illnessDrugs: {
          create: illnessIds.map((illnessId) => ({
            illness: {
              connect: { id: illnessId },
            },
          })),
        },
      },
      include: {
        pharmacy: {
          include: {
            contactInfo: true,
          },
        },
        illnessDrugs: {
          include: {
            illness: true,
          },
        },
      },
    });
  }

  async searchDrugs(params: {
    skip?: number;
    take?: number;
    name?: string;
    illnessId?: string;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const { skip, take, name, illnessId, inStock, minPrice, maxPrice } = params;

    const where: Prisma.DrugWhereInput = {};

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (illnessId) {
      where.illnessDrugs = {
        some: {
          illnessId,
        },
      };
    }

    if (inStock !== undefined) {
      where.inStock = inStock;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    const [drugs, total] = await Promise.all([
      databaseService.drug.findMany({
        where,
        skip,
        take,
        include: {
          pharmacy: {
            include: {
              contactInfo: true,
            },
          },
          illnessDrugs: {
            include: {
              illness: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
      databaseService.drug.count({ where }),
    ]);

    return { drugs, total };
  }

  async getAllDrugs(filters?: {
    illnessId?: string;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const where: Prisma.DrugWhereInput = {};

    if (filters?.illnessId) {
      where.illnessDrugs = {
        some: {
          illnessId: filters.illnessId,
        },
      };
    }

    if (filters?.inStock !== undefined) {
      where.inStock = filters.inStock;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters?.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters?.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    return databaseService.drug.findMany({
      where,
      include: {
        pharmacy: {
          include: {
            contactInfo: true,
          },
        },
        illnessDrugs: {
          include: {
            illness: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async getDrugById(id: string): Promise<Drug | null> {
    return databaseService.drug.findUnique({
      where: { id },
      include: {
        pharmacy: {
          include: {
            contactInfo: true,
          },
        },
        illnessDrugs: {
          include: {
            illness: true,
          },
        },
      },
    });
  }

  async updateDrug(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      sideEffects: string[];
      expiryDate: Date;
      imageUrl: string;
      price: number;
      inStock: boolean;
      illnessIds: string[];
    }>
  ): Promise<Drug> {
    const { illnessIds, ...updateData } = data;

    // If illnessIds is provided, update the relations
    if (illnessIds) {
      // First delete existing relations
      await databaseService.illnessDrug.deleteMany({
        where: { drugId: id },
      });

      // Then create new relations
      return databaseService.drug.update({
        where: { id },
        data: {
          ...updateData,
          illnessDrugs: {
            create: illnessIds.map((illnessId) => ({
              illness: {
                connect: { id: illnessId },
              },
            })),
          },
        },
        include: {
          pharmacy: {
            include: {
              contactInfo: true,
            },
          },
          illnessDrugs: {
            include: {
              illness: true,
            },
          },
        },
      });
    }

    // If no illnessIds provided, just update the drug data
    return databaseService.drug.update({
      where: { id },
      data: updateData,
      include: {
        pharmacy: {
          include: {
            contactInfo: true,
          },
        },
        illnessDrugs: {
          include: {
            illness: true,
          },
        },
      },
    });
  }

  async deleteDrug(id: string): Promise<Drug> {
    // First delete all illness-drug relations
    await databaseService.illnessDrug.deleteMany({
      where: { drugId: id },
    });

    // Then delete the drug
    return databaseService.drug.delete({
      where: { id },
      include: {
        pharmacy: {
          include: {
            contactInfo: true,
          },
        },
        illnessDrugs: {
          include: {
            illness: true,
          },
        },
      },
    });
  }
}

export const drugRepository = new DrugRepository();
