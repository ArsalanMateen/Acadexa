import express from "express";
import authCtrl from "../auth/auth.controller.js";
import courseCtrl from "../courses/course.controller.js";
import enrollmentCtrl from "./enrollment.controller.js";

const router = express.Router();

router.post("/api/enrollment/new/:courseId", authCtrl.requireSignin, enrollmentCtrl.findEnrollment, enrollmentCtrl.create);
router.get("/api/enrollment/:enrollmentId", authCtrl.requireSignin, enrollmentCtrl.isStudent, enrollmentCtrl.read);
router.param("courseId", courseCtrl.courseByID);
router.param("enrollmentId", enrollmentCtrl.enrollmentByID);

export default router;
