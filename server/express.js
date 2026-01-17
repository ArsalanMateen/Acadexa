import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import usersRoutes from "./modules/users/user.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/", usersRoutes);
app.use("/", authRoutes);


export default app;
