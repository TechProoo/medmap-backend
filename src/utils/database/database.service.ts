import { PrismaClient } from "@prisma/client";
import { LoggerPaths } from "../../constants/logger-paths.enum";
import { JsPromise } from "@prisma/client/runtime/library";
import { LoggerService } from "../../logger/logger.service";
export class DatabaseService extends PrismaClient {
  private logger = new LoggerService(LoggerPaths.DATABASE);
  constructor() {
    super();
  }
  $connect(): JsPromise<void> {
    this.logger.info("Connecting to the database...");
    return super
      .$connect()
      .then(() => {
        this.logger.info("Connected to the database Successfully");
      })
      .catch((error) => {
        this.logger.error("Database Connection Error: ", error);
        process.exit(0);
      });
  }

  $disconnect(): JsPromise<void> {
    this.logger.info("Disconnecting from the database...");
    return super.$disconnect().then(() => {
      this.logger.info("Disconnected from the database Successfully");
    });
  }
}
