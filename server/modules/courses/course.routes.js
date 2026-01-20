import express from "express";
import userCtrl from "../users/user.controller.js";
import authCtrl from "../auth/auth.controller.js";
import courseCtrl from "./course.controller.js";

const router = express.Router();

router.post("/api/courses/by/:userId", authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.isInstructor, courseCtrl.create);
router.get("/api/courses/by/:userId", authCtrl.requireSignin, authCtrl.hasAuthorization, courseCtrl.listByInstructor);
router.get("/api/courses/:courseId", authCtrl.optionalSignin, courseCtrl.read);
router.param("userId", userCtrl.userByID);
router.param("courseId", courseCtrl.courseByID);

export default router;
