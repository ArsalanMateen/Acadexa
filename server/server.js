import dns from "dns";
import config from "./config/config.js";
import app from "./express.js";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

mongoose.Promise = global.Promise;
mongoose.connection.on("error", (err) => {
  console.error("MongoDB Atlas connection error:", err.message);
});
mongoose.connection.once("open", () => {
  console.info(`Connected to MongoDB Atlas: ${mongoose.connection.name}`);
});

try {
  if (!config.mongoUri) throw new Error("ACADEXA_DB_URI is required.");

  await mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    // Deploy declared indexes explicitly; starting the app must not build indexes on live data.
    autoIndex: false,
    dbName: config.mongoDbName,
  });

  const server = app.listen(config.port, () => {
    console.info("Server started on port %s.", config.port);
  });
  server.on("error", async (error) => {
    console.error("Server failed to start:", error.message);
    process.exitCode = 1;

    await mongoose.disconnect();
  });
} catch (error) {
  console.error("Startup failed:", error.message);
  process.exitCode = 1;

  await mongoose.disconnect();
}
