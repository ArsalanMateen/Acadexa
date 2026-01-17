import express from "express";
import authCtrl from "./auth.controller.js";

const router = express.Router();

router.post("/auth/signin", authCtrl.signin);


export default router;
