import express from "express";
import userCtrl from "./user.controller.js";
import authCtrl from "../auth/auth.controller.js";

const router = express.Router();

router.post("/api/users", userCtrl.create);
router.get("/api/users/:userId", authCtrl.requireSignin, userCtrl.read);
router.put("/api/users/:userId", authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update);
router.param("userId", userCtrl.userByID);

export default router;
