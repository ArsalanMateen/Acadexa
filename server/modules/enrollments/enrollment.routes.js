import express from "express";
import authCtrl from "../auth/auth.controller.js";
import courseCtrl from "../courses/course.controller.js";
import enrollmentCtrl from "./enrollment.controller.js";

const router = express.Router();

router.get("/api/enrollment/for-course/:targetCourseId", authCtrl.requireSignin, enrollmentCtrl.enrollmentForCourse);
router.get("/api/enrollment/stats/by-instructor", authCtrl.requireSignin, enrollmentCtrl.enrollmentStatsByInstructor);
router.get("/api/enrollment/enrolled", authCtrl.requireSignin, enrollmentCtrl.listEnrolled);
router.post("/api/enrollment/new/:courseId", authCtrl.requireSignin, enrollmentCtrl.findEnrollment, enrollmentCtrl.create);
router.get("/api/enrollment/:enrollmentId", authCtrl.requireSignin, enrollmentCtrl.isStudent, enrollmentCtrl.read);
router.put("/api/enrollment/complete/:enrollmentId", authCtrl.requireSignin, enrollmentCtrl.isStudent, enrollmentCtrl.complete);
router.get("/api/enrollment/stats/:courseId", authCtrl.requireSignin, courseCtrl.isInstructor, enrollmentCtrl.enrollmentStats);
router.param("courseId", courseCtrl.courseByID);
router.param("enrollmentId", enrollmentCtrl.enrollmentByID);

export default router;
