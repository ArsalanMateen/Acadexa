import dns from "dns";
import config from "./config/config.js";
import app from "./express.js";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

try {
  if (!config.mongoUri) throw new Error("ACADEXA_DB_URI is required.");
  await mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, dbName: config.mongoDbName });
  app.listen(config.port);
} catch (error) {
  console.error("Startup failed:", error.message);
  process.exitCode = 1;
  await mongoose.disconnect();
}
