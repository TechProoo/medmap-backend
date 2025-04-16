import { DatabaseService } from "./database.service";

export const databaseService = new DatabaseService();
databaseService.$connect();
