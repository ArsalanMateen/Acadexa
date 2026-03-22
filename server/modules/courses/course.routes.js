import express from "express";
import userCtrl from "../users/user.controller.js";
import authCtrl from "../auth/auth.controller.js";
import courseCtrl from "./course.controller.js";

const router = express.Router();

router.get("/api/courses/defaultphoto", courseCtrl.defaultPhoto);
router.get("/api/courses/published", courseCtrl.listPublished);
router.post("/api/courses/by/:userId", authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.isInstructor, courseCtrl.create);
router.get("/api/courses/by/:userId", authCtrl.requireSignin, authCtrl.hasAuthorization, courseCtrl.listByInstructor);
router.get("/api/courses/:overviewCourseId", authCtrl.optionalSignin, courseCtrl.readOverview);
router.put("/api/courses/:courseId", authCtrl.requireSignin, courseCtrl.isInstructor, courseCtrl.update);
router.put("/api/courses/:courseId/lesson/new", authCtrl.requireSignin, courseCtrl.isInstructor, courseCtrl.newLesson);
router.get("/api/courses/photo/:courseId", courseCtrl.photo, courseCtrl.defaultPhoto);
router.delete("/api/courses/:courseId", authCtrl.requireSignin, courseCtrl.isInstructor, courseCtrl.remove);
router.param("userId", userCtrl.userByID);
router.param("courseId", courseCtrl.courseByID);

export default router;
