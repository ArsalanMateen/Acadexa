import express from "express";
import userCtrl from "../users/user.controller.js";
import authCtrl from "../auth/auth.controller.js";
import courseCtrl from "./course.controller.js";

const router = express.Router();

router.route("/api/courses/published").get(courseCtrl.listPublished);

router
  .route("/api/courses/by/:userId")
  .post(
    authCtrl.requireSignin,
    authCtrl.hasAuthorization,
    userCtrl.isInstructor,
    courseCtrl.create,
  )
  .get(
    authCtrl.requireSignin,
    authCtrl.hasAuthorization,
    courseCtrl.listByInstructor,
  );

router
  .route("/api/courses/:courseId/lesson/new")
  .put(authCtrl.requireSignin, courseCtrl.isInstructor, courseCtrl.newLesson);

// A distinct parameter prevents the shared full-document loader from running before optional auth.
router.get(
  "/api/courses/:overviewCourseId",
  authCtrl.optionalSignin,
  courseCtrl.readOverview,
);

router
  .route("/api/courses/:courseId")
  .put(authCtrl.requireSignin, courseCtrl.isInstructor, courseCtrl.update)
  .delete(authCtrl.requireSignin, courseCtrl.isInstructor, courseCtrl.remove);

router.param("courseId", courseCtrl.courseByID);
router.param("userId", userCtrl.userByID);

export default router;
