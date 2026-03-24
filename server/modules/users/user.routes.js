import express from "express";
import userCtrl from "./user.controller.js";
import authCtrl from "../auth/auth.controller.js";

const router = express.Router();
router
  .route("/api/users")
  .get(authCtrl.requireSignin, userCtrl.list)
  .post(userCtrl.create);
router
  .route("/api/users/:userId")
  .get(authCtrl.requireSignin, userCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove);
router.param("userId", userCtrl.userByID);

export default router;
