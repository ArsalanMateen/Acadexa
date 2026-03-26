import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./modules/users/user.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import courseRoutes from "./modules/courses/course.routes.js";
import enrollmentRoutes from "./modules/enrollments/enrollment.routes.js";

const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/", userRoutes);
app.use("/", authRoutes);
app.use("/", courseRoutes);
app.use("/", enrollmentRoutes);

app.use(["/api", "/auth"], (req, res) =>
  res.status(404).json({ error: "Endpoint not found" }),
);

if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.resolve(SERVER_DIR, "../client/dist");

  app.use(express.static(clientDistPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((err, req, res, _next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: err.name + ": " + err.message });
  } else {
    res.status(400).json({ error: err.name + ": " + err.message });
    console.error(err);
  }
});

export default app;
