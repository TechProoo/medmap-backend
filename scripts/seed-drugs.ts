import * as fs from "fs";
import * as path from "path";
import csvParser from "csv-parser";
import { databaseService } from "../src/utils/database";

const logger = console.log;

// Define path to the CSV file relative to the script location
const dataDir = path.join(__dirname, "data");
const drugsFilePath = path.join(dataDir, "drugs.csv");

interface DrugRow {
  "Medicine Name": string;
  Composition: string;
  Uses: string;
  Side_effects: string;
  "Image URL": string;
  Manufacturer: string;
}

function parseCsv<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data: T) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

async function main() {
  logger("Starting drugs seeding process...");

  try {
    // First get all pharmacies to distribute drugs among them
    const pharmacies = await databaseService.pharmacy.findMany({
      select: { id: true },
    });

    if (pharmacies.length === 0) {
      throw new Error("No pharmacies found. Please seed pharmacies first.");
    }

    const drugRows = await parseCsv<DrugRow>(drugsFilePath);
    logger(`Parsed ${drugRows.length} drugs from CSV`);

    let seededCount = 0;
    let skippedCount = 0;

    for (const row of drugRows) {
      try {
        // Each drug will be added to 1-2 random pharmacies
        const numPharmacies = Math.floor(Math.random() * 1) + 1;
        const selectedPharmacies = [...pharmacies]
          .sort(() => Math.random() - 0.5)
          .slice(0, numPharmacies);

        // Create the base drug data
        const drugData = {
          name: row["Medicine Name"],
          composition: row.Composition,
          description: row.Composition,
          uses: row.Uses,
          sideEffects: row.Side_effects.split(" "), // Split on space since there's no clear delimiter
          imageUrl: row["Image URL"],
          manufacturer: row.Manufacturer,
          price: Math.floor(Math.random() * 10000) + 100, // Random price between 100 and 10100
          stocks: Math.floor(Math.random() * 100) + 1, // Random stock between 1 and 100
          expiryDate: new Date(Date.now() + Math.random() * 31536000000), // Random date within next year
        };

        // Create the drug for each selected pharmacy
        for (const pharmacy of selectedPharmacies) {
          await databaseService.drug.upsert({
            where: {
              pharmacyId_name: {
                pharmacyId: pharmacy.id,
                name: drugData.name,
              },
            },
            update: {
              ...drugData,
              price: drugData.price, // Update price even if drug exists
              stocks: drugData.stocks, // Update stocks even if drug exists
              expiryDate: drugData.expiryDate, // Update expiry date even if drug exists
            },
            create: {
              ...drugData,
              pharmacyId: pharmacy.id,
            },
          });

          seededCount++;
          logger(
            `Upserted drug "${drugData.name}" for pharmacy ${pharmacy.id}`
          );
        }
      } catch (error) {
        logger(`Failed to upsert drug "${row["Medicine Name"]}":`, error);
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
