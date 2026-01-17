import express from "express";
import userCtrl from "./user.controller.js";

const router = express.Router();

router.post("/api/users", userCtrl.create);


export default router;
