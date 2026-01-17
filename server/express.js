import express from "express";
import bodyParser from "body-parser";
import usersRoutes from "./modules/users/user.routes.js";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/", usersRoutes);


export default app;
