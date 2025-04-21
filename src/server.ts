import "reflect-metadata"; // Add this line at the very top
import { server } from "./app";
import app from "./app";
import { EnvValidation } from "./utils/config/env.validation";

// Start the server
server.listen(app.get("port"), () => {
  console.log("Server Starting up....");
  console.log(`=>     http://localhost:${app.get("port")}`);

  // Validating environment variables
  EnvValidation.validate();

  if (EnvValidation.isDevelopment()) {
    console.log("Environment: Development");
  } else {
    console.log("Environment: Production");
  }
  console.log(`Press CTRL + C to stop the server`);
});
