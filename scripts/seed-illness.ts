import * as fs from "fs";
import * as path from "path";
import csvParser from "csv-parser";
import { databaseService } from "../src/utils/database"; // Assuming databaseService handles connection

const logger = console.log;

// Define paths to the CSV files relative to the script location
const dataDir = path.join(__dirname, "data");
const symptomsFilePath = path.join(dataDir, "illnesses_symptoms.csv");
const descriptionsFilePath = path.join(dataDir, "symptom_Description.csv");
const precautionsFilePath = path.join(dataDir, "symptom_precaution.csv");

interface SymptomRow {
  Disease: string;
  [key: string]: string; // For Symptom_1, Symptom_2, ...
}

interface DescriptionRow {
  Disease: string;
  Description: string;
}

interface PrecautionRow {
  Disease: string;
  [key: string]: string; // For Precaution_1, Precaution_2, ...
}

interface IllnessData {
  name: string;
  symptoms: string[][];
  description?: string;
  precautions: string[];
}

/**
 * Reads and parses a CSV file.
 * @param filePath The path to the CSV file.
 * @returns A promise that resolves with an array of row objects.
 */
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

/**
 * Processes symptom data, grouping symptoms by disease.
 * @param rows Array of symptom rows from the CSV.
 * @returns A map where keys are disease names and values are arrays of symptom arrays.
 */
function processSymptoms(rows: SymptomRow[]): Map<string, string[][]> {
  const symptomsMap = new Map<string, string[][]>();
  rows.forEach((row) => {
    const diseaseName = row.Disease?.trim();
    if (!diseaseName) return;

    const currentSymptoms = Object.keys(row)
      .filter((key) => key.startsWith("Symptom_"))
      .map((key) => row[key]?.trim())
      .filter((symptom): symptom is string => !!symptom && symptom.length > 0); // Filter out empty/undefined symptoms

    if (currentSymptoms.length > 0) {
      if (symptomsMap.has(diseaseName)) {
        symptomsMap.get(diseaseName)?.push(currentSymptoms);
      } else {
        symptomsMap.set(diseaseName, [currentSymptoms]);
      }
    }
  });
  return symptomsMap;
}

/**
 * Processes description data.
 * @param rows Array of description rows from the CSV.
 * @returns A map where keys are disease names and values are descriptions.
 */
function processDescriptions(rows: DescriptionRow[]): Map<string, string> {
  const descriptionsMap = new Map<string, string>();
  rows.forEach((row) => {
    const diseaseName = row.Disease?.trim();
    const description = row.Description?.trim();
    if (diseaseName && description) {
      descriptionsMap.set(diseaseName, description);
    }
  });
  return descriptionsMap;
}

/**
 * Processes precaution data.
 * @param rows Array of precaution rows from the CSV.
 * @returns A map where keys are disease names and values are arrays of precautions.
 */
function processPrecautions(rows: PrecautionRow[]): Map<string, string[]> {
  const precautionsMap = new Map<string, string[]>();
  rows.forEach((row) => {
    const diseaseName = row.Disease?.trim();
    if (!diseaseName) return;

    const currentPrecautions = Object.keys(row)
      .filter((key) => key.startsWith("Precaution_"))
      .map((key) => row[key]?.trim())
      .filter(
        (precaution): precaution is string =>
          !!precaution && precaution.length > 0
      ); // Filter out empty/undefined precautions

    // Since precautions are unique per disease in this file, we just set them
    if (currentPrecautions.length > 0 && !precautionsMap.has(diseaseName)) {
      precautionsMap.set(diseaseName, currentPrecautions);
    }
  });
  return precautionsMap;
}

async function main() {
  logger("Starting illness seeding process...");

  try {
    // Ensure database is connected (optional if databaseService handles it)
    // await databaseService.$connect(); // Uncomment if needed

    logger("Parsing CSV files...");
    const [symptomRows, descriptionRows, precautionRows] = await Promise.all([
      parseCsv<SymptomRow>(symptomsFilePath),
      parseCsv<DescriptionRow>(descriptionsFilePath),
      parseCsv<PrecautionRow>(precautionsFilePath),
    ]);
    logger("CSV files parsed successfully.");

    logger("Processing data...");
    const symptomsMap = processSymptoms(symptomRows);
    const descriptionsMap = processDescriptions(descriptionRows);
    const precautionsMap = processPrecautions(precautionRows);
    logger("Data processed successfully.");

    const illnessDataToSeed: IllnessData[] = [];
    for (const [diseaseName, symptoms] of symptomsMap.entries()) {
      illnessDataToSeed.push({
        name: diseaseName,
        symptoms: symptoms, // Already in string[][] format
        description: descriptionsMap.get(diseaseName), // Optional
        precautions: precautionsMap.get(diseaseName) || [], // Default to empty array
      });
    }

    logger(`Preparing to seed ${illnessDataToSeed.length} illnesses...`);

    let seededCount = 0;
    let skippedCount = 0;
    for (const illness of illnessDataToSeed) {
      try {
        await databaseService.illness.upsert({
          where: { name: illness.name },
          update: {
            description: illness.description,
            symptoms: illness.symptoms, // Prisma expects Json type here
            precautions: illness.precautions,
          },
          create: {
            name: illness.name,
            description: illness.description,
            symptoms: illness.symptoms, // Prisma expects Json type here
            precautions: illness.precautions,
          },
        });
        seededCount++;
        logger(`Upserted illness: ${illness.name}`);
      } catch (error) {
        logger(`Failed to upsert illness "${illness.name}":`, error);
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
