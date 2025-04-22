import { Drug, Prisma } from "@prisma/client";
import { databaseService } from "../../utils/database";

export class DrugRepository {
  drugDelegate = databaseService.drug;
  async createDrug(data: {
    name: string;
    description?: string;
    sideEffects: string[];
    pharmacyId: string;
    expiryDate: Date;
    imageUrl?: string;
    price: number;
    stocks: number;
    illnessIds: string[];
  }): Promise<Drug> {
    const { illnessIds, ...drugData } = data;
    return this.drugDelegate.create({
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
    minStocks?: number;
    maxStocks?: number;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const {
      skip,
      take,
      name,
      illnessId,
      minStocks,
      maxStocks,
      minPrice,
      maxPrice,
    } = params;

    const skipValue = skip ?? 0;
    const takeValue = take ?? 10; // Default page size

    // Build WHERE clause parts for raw query
    const conditions: Prisma.Sql[] = [];
    if (name) {
      // Use Prisma.sql for safe parameter interpolation
      conditions.push(
        Prisma.sql`d.search_vector @@ websearch_to_tsquery('english', ${name})`
      );
    }
    if (illnessId) {
      // Join needed for illnessId filtering in raw query
      conditions.push(
        Prisma.sql`EXISTS (SELECT 1 FROM "IllnessDrug" idr WHERE idr."drugId" = d.id AND idr."illnessId" = ${illnessId})`
      );
    }
    if (minStocks !== undefined) {
      conditions.push(Prisma.sql`d.stocks >= ${minStocks}`);
    }
    if (maxStocks !== undefined) {
      conditions.push(Prisma.sql`d.stocks <= ${maxStocks}`);
    }
    if (minPrice !== undefined) {
      conditions.push(Prisma.sql`d.price >= ${minPrice}`);
    }
    if (maxPrice !== undefined) {
      conditions.push(Prisma.sql`d.price <= ${maxPrice}`);
    }

    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
        : Prisma.empty;

    // Construct the query to get IDs and rank
    const idQuery = Prisma.sql`
      SELECT d.id,
             ${
               name
                 ? Prisma.sql`ts_rank_cd(d.search_vector, websearch_to_tsquery('english', ${name})) as rank`
                 : Prisma.sql`0 as rank`
             }
      FROM "Drug" d
      ${whereClause}
      ORDER BY rank DESC
      LIMIT ${takeValue} OFFSET ${skipValue}
    `;

    // Construct the count query
    const countQuery = Prisma.sql`
      SELECT COUNT(d.id)
      FROM "Drug" d
      ${whereClause}
    `;

    // Execute both queries in a transaction
    const [idResults, countResult] = await databaseService.$transaction([
      databaseService.$queryRaw<{ id: string }[]>(idQuery),
      databaseService.$queryRaw<{ count: bigint }[]>(countQuery),
    ]);

    const drugIds = idResults.map((r) => r.id);
    const total = Number(countResult[0].count);

    if (drugIds.length === 0) {
      return { drugs: [], total: 0 };
    }

    // Fetch full drug data with relations using the IDs
    const drugs = await databaseService.drug.findMany({
      where: {
        id: { in: drugIds },
      },
      include: {
        pharmacy: { include: { contactInfo: true } },
        illnessDrugs: { include: { illness: true } },
      },
      // We need to re-order based on the rank returned by the raw query
    });

    // Re-order drugs based on idResults order (which respects rank)
    const orderedDrugs = drugIds
      .map((id) => drugs.find((d) => d.id === id))
      .filter((d) => d !== undefined);

    return { drugs: orderedDrugs, total };
  }

  async getAllDrugs(filters?: {
    illnessId?: string;
    minStocks?: number;
    maxStocks?: number;
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

    if (filters?.minStocks !== undefined || filters?.maxStocks !== undefined) {
      where.stocks = {};
      if (filters?.minStocks !== undefined) {
        where.stocks.gte = filters.minStocks;
      }
      if (filters?.maxStocks !== undefined) {
        where.stocks.lte = filters.maxStocks;
      }
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
      stocks: number;
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

  async getDrugsByPharmacyId(pharmacyId: string) {
    return databaseService.drug.findMany({
      where: { pharmacyId },
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
}

export const drugRepository = new DrugRepository();
