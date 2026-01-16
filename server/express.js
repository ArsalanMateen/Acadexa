import express from "express";
import bodyParser from "body-parser";


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/health", (req, res) => res.json({ status: "ok" }));



export default app;
