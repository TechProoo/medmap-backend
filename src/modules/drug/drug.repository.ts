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
    const { illnessIds = [], ...drugData } = data;
    console.log("illness ids", illnessIds);
    drugData.price = parseFloat(drugData.price.toString());
    if (drugData.stocks)
      drugData.stocks = parseInt(drugData.stocks.toString(), 10);
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
    let useFallbackSearch = false;

    // Only add text search if name is provided
    if (name) {
      // Use Prisma.sql for safe parameter interpolation with full text search
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

    let drugIds = idResults.map((r) => r.id);
    let total = Number(countResult[0].count);

    // If search by name was attempted but returned no results, use ILIKE as a fallback
    if (name && drugIds.length === 0) {
      useFallbackSearch = true;

      // Build fallback conditions using ILIKE for partial matches
      const fallbackConditions: Prisma.Sql[] = [];

      // Use ILIKE for partial string matching
      fallbackConditions.push(
        Prisma.sql`(d.name ILIKE ${`%${name}%`} OR d.description ILIKE ${`%${name}%`})`
      );

      // Keep all other non-search conditions
      if (illnessId) {
        fallbackConditions.push(
          Prisma.sql`EXISTS (SELECT 1 FROM "IllnessDrug" idr WHERE idr."drugId" = d.id AND idr."illnessId" = ${illnessId})`
        );
      }
      if (minStocks !== undefined) {
        fallbackConditions.push(Prisma.sql`d.stocks >= ${minStocks}`);
      }
      if (maxStocks !== undefined) {
        fallbackConditions.push(Prisma.sql`d.stocks <= ${maxStocks}`);
      }
      if (minPrice !== undefined) {
        fallbackConditions.push(Prisma.sql`d.price >= ${minPrice}`);
      }
      if (maxPrice !== undefined) {
        fallbackConditions.push(Prisma.sql`d.price <= ${maxPrice}`);
      }

      const fallbackWhereClause = Prisma.sql`WHERE ${Prisma.join(
        fallbackConditions,
        " AND "
      )}`;

      // Execute fallback queries in a transaction
      const [fallbackIdResults, fallbackCountResult] =
        await databaseService.$transaction([
          databaseService.$queryRaw<{ id: string }[]>(Prisma.sql`
          SELECT d.id, 0 as rank
          FROM "Drug" d
          ${fallbackWhereClause}
          ORDER BY d.name
          LIMIT ${takeValue} OFFSET ${skipValue}
        `),
          databaseService.$queryRaw<{ count: bigint }[]>(Prisma.sql`
          SELECT COUNT(d.id)
          FROM "Drug" d
          ${fallbackWhereClause}
        `),
        ]);

      drugIds = fallbackIdResults.map((r) => r.id);
      total = Number(fallbackCountResult[0].count);
    }

    if (drugIds.length === 0) {
      return {
        data: [],
        pagination: {
          hasMore: false,
          hasPrev: false,
          totalItems: 0,
          totalPages: 0,
          page: 1,
          limit: takeValue,
        },
      };
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
      .filter((d) => d !== undefined); // Type assertion

    const totalPages = Math.ceil(total / takeValue);
    const currentPage = Math.floor(skipValue / takeValue) + 1;
    return {
      data: orderedDrugs,
      pagination: {
        hasMore: currentPage < totalPages,
        hasPrev: currentPage > 1,
        totalItems: total,
        totalPages,
        page: currentPage,
        limit: takeValue,
        searchMethod: useFallbackSearch
          ? "pattern matching (ILIKE)"
          : "full text search",
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

  async getDrugsByPharmacyId(
    pharmacyId: string,
    {
      page = 1,
      limit = 10,
      all = false,
    }: { page?: number; limit?: number; all?: boolean }
  ) {
    const skipValue = (page - 1) * limit;
    const takeValue = limit;

    const where: Prisma.DrugWhereInput = { pharmacyId };
    if (all) {
      // return all drugs without pagination
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
    const [drugs, total] = await databaseService.$transaction([
      databaseService.drug.findMany({
        where,
        skip: skipValue,
        take: takeValue,
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

    const totalPages = Math.ceil(total / takeValue);
    const currentPage = page;

    return {
      data: drugs,
      pagination: {
        hasMore: currentPage < totalPages,
        hasPrev: currentPage > 1,
        totalItems: total,
        totalPages,
        page: currentPage,
        limit: takeValue,
      },
    };
  }
}

export const drugRepository = new DrugRepository();
