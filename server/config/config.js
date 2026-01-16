import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const config = {
  env: process.env.NODE_ENV,
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.ACADEXA_DB_URI,
  mongoDbName: process.env.ACADEXA_NS,
};

export default config;
