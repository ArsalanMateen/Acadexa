import express from "express";
import authCtrl from "../auth/auth.controller.js";
import courseCtrl from "../courses/course.controller.js";
import enrollmentCtrl from "./enrollment.controller.js";

const router = express.Router();

router
  .route("/api/enrollment/enrolled")
  .get(authCtrl.requireSignin, enrollmentCtrl.listEnrolled);

router
  .route("/api/enrollment/new/:courseId")
  .post(
    authCtrl.requireSignin,
    enrollmentCtrl.findEnrollment,
    enrollmentCtrl.create,
  );

router.get(
  "/api/enrollment/stats/by-instructor",
  authCtrl.requireSignin,
  enrollmentCtrl.enrollmentStatsByInstructor,
);
router.get(
  "/api/enrollment/for-course/:targetCourseId",
  authCtrl.requireSignin,
  enrollmentCtrl.enrollmentForCourse,
);

router
  .route("/api/enrollment/stats/:courseId")
  .get(
    authCtrl.requireSignin,
    courseCtrl.isInstructor,
    enrollmentCtrl.enrollmentStats,
  );

router
  .route("/api/enrollment/complete/:enrollmentId")
  .put(
    authCtrl.requireSignin,
    enrollmentCtrl.isStudent,
    enrollmentCtrl.complete,
  );

router
  .route("/api/enrollment/:enrollmentId")
  .get(authCtrl.requireSignin, enrollmentCtrl.isStudent, enrollmentCtrl.read);

router.param("courseId", courseCtrl.courseByID);
router.param("enrollmentId", enrollmentCtrl.enrollmentByID);

export default router;
