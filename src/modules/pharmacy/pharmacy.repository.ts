import { Pharmacy } from "@prisma/client";
import { databaseService } from "../../utils/database";

export class PharmacyRepository {
  async createPharmacy(data: {
    name: string;
    email: string;
    password: string;
    description?: string;
    logoUrl?: string;
    shopImageUrl?: string;
    contactInfo: {
      address: string;
      phone: string;
      state: string;
      country: string;
      longitude: number;
      latitude: number;
    };
  }): Promise<Pharmacy> {
    const { contactInfo, ...pharmacyData } = data;
    return databaseService.pharmacy.create({
      data: {
        ...pharmacyData,
        contactInfo: {
          create: contactInfo,
        },
      },
      include: {
        contactInfo: true,
      },
    });
  }

  async getPharmacyById(id: string): Promise<Pharmacy | null> {
    return databaseService.pharmacy.findUnique({
      where: { id },
      include: {
        contactInfo: true,
      },
    });
  }

  async getPharmacyByEmail(email: string): Promise<Pharmacy | null> {
    return databaseService.pharmacy.findUnique({
      where: { email },
      include: {
        contactInfo: true,
      },
    });
  }

  async updatePharmacy(
    id: string,
    data: Partial<{
      name: string;
      description?: string;
      logoUrl?: string;
      shopImageUrl?: string;
      contactInfo: {
        address: string;
        phone: string;
        state: string;
        country: string;
        longitude: number;
        latitude: number;
      };
    }>
  ): Promise<Pharmacy> {
    const { contactInfo, ...pharmacyData } = data;
    return databaseService.pharmacy.update({
      where: { id },
      data: {
        ...pharmacyData,
        ...(contactInfo && {
          contactInfo: {
            update: contactInfo,
          },
        }),
      },
      include: {
        contactInfo: true,
      },
    });
  }
}
