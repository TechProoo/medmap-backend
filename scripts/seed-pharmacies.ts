import { databaseService } from "../src/utils/database";
import * as bcrypt from "bcryptjs";

const logger = console.log;

const pharmacies = [
  {
    name: "HealthFirst Pharmacy",
    email: "health.first@example.com",
    description: "Your trusted neighborhood pharmacy since 1995",
    contactInfo: {
      address: "123 Main Street",
      phone: "+2348012345678",
      state: "Lagos",
      country: "Nigeria",
      longitude: 3.379206,
      latitude: 6.524379,
    },
  },
  {
    name: "MedPlus Pharmaceuticals",
    email: "medplus@example.com",
    description: "24/7 pharmacy services with home delivery",
    contactInfo: {
      address: "45 Allen Avenue",
      phone: "+2348023456789",
      state: "Lagos",
      country: "Nigeria",
      longitude: 3.357968,
      latitude: 6.601838,
    },
  },
  {
    name: "Care Plus Pharmacy",
    email: "careplus@example.com",
    description: "Quality healthcare products and professional service",
    contactInfo: {
      address: "78 Awolowo Road",
      phone: "+2348034567890",
      state: "Lagos",
      country: "Nigeria",
      longitude: 3.425154,
      latitude: 6.443879,
    },
  },
  {
    name: "Wellness Pharmaceuticals",
    email: "wellness@example.com",
    description: "Your family's health is our priority",
    contactInfo: {
      address: "15 Stadium Road",
      phone: "+2348045678901",
      state: "Port Harcourt",
      country: "Nigeria",
      longitude: 7.03384,
      latitude: 4.81603,
    },
  },
  {
    name: "LifeCare Pharmacy",
    email: "lifecare@example.com",
    description: "Comprehensive pharmaceutical care",
    contactInfo: {
      address: "234 Aba Road",
      phone: "+2348056789012",
      state: "Port Harcourt",
      country: "Nigeria",
      longitude: 7.01055,
      latitude: 4.81834,
    },
  },
  {
    name: "New Health Pharmacy",
    email: "newhealth@example.com",
    description: "Modern pharmacy with traditional values",
    contactInfo: {
      address: "56 Independence Way",
      phone: "+2348067890123",
      state: "Abuja",
      country: "Nigeria",
      longitude: 7.491302,
      latitude: 9.072264,
    },
  },
  {
    name: "Unity Pharmaceuticals",
    email: "unity@example.com",
    description: "United in serving your health needs",
    contactInfo: {
      address: "89 Wuse Market Road",
      phone: "+2348078901234",
      state: "Abuja",
      country: "Nigeria",
      longitude: 7.459387,
      latitude: 9.081999,
    },
  },
  {
    name: "Royal Pharmacy",
    email: "royal@example.com",
    description: "Royal care for everyone",
    contactInfo: {
      address: "12 Ring Road",
      phone: "+2348089012345",
      state: "Ibadan",
      country: "Nigeria",
      longitude: 3.88625,
      latitude: 7.37558,
    },
  },
  {
    name: "Green Cross Pharmacy",
    email: "greencross@example.com",
    description: "Your health, our mission",
    contactInfo: {
      address: "445 Challenge Road",
      phone: "+2348090123456",
      state: "Ibadan",
      country: "Nigeria",
      longitude: 3.89142,
      latitude: 7.38647,
    },
  },
  {
    name: "Sunrise Pharmacy",
    email: "sunrise@example.com",
    description: "Rising to meet your health needs",
    contactInfo: {
      address: "23 Market Street",
      phone: "+2348001234567",
      state: "Kano",
      country: "Nigeria",
      longitude: 8.53172,
      latitude: 11.99179,
    },
  },
  {
    name: "Medicare Pharmacy",
    email: "medicare@example.com",
    description: "Caring for generations",
    contactInfo: {
      address: "78 Zoo Road",
      phone: "+2348012345670",
      state: "Kano",
      country: "Nigeria",
      longitude: 8.53689,
      latitude: 12.00005,
    },
  },
  {
    name: "People's Pharmacy",
    email: "peoples@example.com",
    description: "Healthcare for the people",
    contactInfo: {
      address: "90 Old Market Road",
      phone: "+2348023456781",
      state: "Enugu",
      country: "Nigeria",
      longitude: 7.4946,
      latitude: 6.44167,
    },
  },
  {
    name: "Victory Pharmaceuticals",
    email: "victory@example.com",
    description: "Victorious health solutions",
    contactInfo: {
      address: "34 Zik Avenue",
      phone: "+2348034567892",
      state: "Enugu",
      country: "Nigeria",
      longitude: 7.50584,
      latitude: 6.43278,
    },
  },
  {
    name: "Hope Pharmacy",
    email: "hope@example.com",
    description: "Bringing hope through healthcare",
    contactInfo: {
      address: "67 Airport Road",
      phone: "+2348045678903",
      state: "Benin",
      country: "Nigeria",
      longitude: 5.59563,
      latitude: 6.33492,
    },
  },
  {
    name: "Guardian Pharmacy",
    email: "guardian@example.com",
    description: "Guarding your health 24/7",
    contactInfo: {
      address: "89 Sapele Road",
      phone: "+2348056789014",
      state: "Benin",
      country: "Nigeria",
      longitude: 5.62748,
      latitude: 6.34028,
    },
  },
];

async function main() {
  logger("Starting pharmacy seeding process...");

  try {
    let seededCount = 0;
    let skippedCount = 0;

    for (const pharmacyData of pharmacies) {
      try {
        const hashedPassword = await bcrypt.hash("Password@123", 10); // Using bcrypt directly

        await databaseService.pharmacy.upsert({
          where: { email: pharmacyData.email },
          update: {
            name: pharmacyData.name,
            description: pharmacyData.description,
            contactInfo: {
              update: pharmacyData.contactInfo,
            },
          },
          create: {
            ...pharmacyData,
            password: hashedPassword,
            contactInfo: {
              create: pharmacyData.contactInfo,
            },
          },
        });

        seededCount++;
        logger(`Upserted pharmacy: ${pharmacyData.name}`);
      } catch (error) {
        logger(`Failed to upsert pharmacy "${pharmacyData.name}":`, error);
        skippedCount++;
      }
    }

    logger(
      `Seeding complete. Upserted: ${seededCount}, Skipped: ${skippedCount}`
    );
  } catch (error) {
    logger("An error occurred during the seeding process:", error);
    process.exitCode = 1;
  } finally {
    logger("Disconnecting from database...");
    await databaseService.$disconnect();
    logger("Database disconnected.");
  }
}

main();
