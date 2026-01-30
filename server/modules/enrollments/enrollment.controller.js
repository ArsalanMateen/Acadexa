import Enrollment from "./enrollment.model.js";
import Course from "../courses/course.model.js";
import errorHandler from "../../lib/dbErrorHandler.js";
import { alignLessonStatus, isCourseComplete } from "./enrollmentProgress.js";

const findEnrollment = async (req, res, next) => {
  try {
    let enrollments = await Enrollment.find({
      course: req.course._id,
      student: req.auth._id,
    });

    if (enrollments.length === 0) {
      next();
    } else {
      res.json(enrollments[0]);
    }
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const create = async (req, res) => {
  if (!req.course.published) {
    return res.status(400).json({ error: "This course is not open for enrollment." });
  }

  let newEnrollment = {
    course: req.course,
    student: req.auth,
  };
  newEnrollment.lessonStatus = req.course.lessons.map((lesson) => {
    return { lesson: lesson._id || lesson, complete: false };
  });

  const enrollment = new Enrollment(newEnrollment);

  try {
    let result = await enrollment.save();

    return res.status(200).json(result);
  } catch (err) {
    if (err.code === 11000) {
      const existing = await Enrollment.findOne({ course: req.course._id, student: req.auth._id });

      if (existing) return res.json(existing);
    }

    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const enrollmentByID = async (req, res, next, id) => {
  try {
    let enrollment = await Enrollment.findById(id)
      .populate({
        path: "course",
        populate: { path: "instructor", select: "_id name" },
      })
      .populate("student", "_id name");

    if (!enrollment) {
      return res.status(400).json({
        error: "Enrollment not found",
      });
    }

    req.enrollment = enrollment;
    next();
  } catch {
    return res.status(400).json({
      error: "Could not retrieve enrollment",
    });
  }
};

const isStudent = (req, res, next) => {
  const isStudent =
    req.auth &&
    req.enrollment &&
    req.enrollment.student &&
    String(req.auth._id) === String(req.enrollment.student._id || req.enrollment.student);

  if (!isStudent) {
    return res.status(403).json({
      error: "User is not enrolled",
    });
  }

  next();
};

const read = async (req, res) => {
  try {
    return res.json(await synchronizeProgress(req.enrollment));
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const listEnrolled = async (req, res) => {
  try {
    let enrollments = await Enrollment.find({ student: req.auth._id })
      .sort({ completed: 1 })
      .populate({
        path: "course",
        select: "_id name category description image lessons instructor",
        populate: { path: "instructor", select: "_id name" },
      });
    const current = await Promise.all(
      enrollments.filter((item) => item.course).map(synchronizeProgress),
    );

    res.json(current);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const synchronizeProgress = async (enrollment) => {
  if (!enrollment.course) throw new Error("This course is no longer available.");

  const statuses = alignLessonStatus(enrollment.course.lessons, enrollment.lessonStatus);
  const changed =
    statuses.length !== enrollment.lessonStatus.length ||
    statuses.some(
      (status, index) => String(status.lesson) !== String(enrollment.lessonStatus[index]?.lesson),
    );

  if (changed) {
    // Only change curriculum alignment if no concurrent progress write occurred.
    const previousUpdated = enrollment.updated;

    enrollment.lessonStatus = statuses;

    const data = { lessonStatus: enrollment.lessonStatus.toObject(), updated: new Date() };

    if (isCourseComplete(statuses) && !enrollment.completed) {
      data.completed = new Date();
    }

    const operation = { $set: data };

    if (!isCourseComplete(statuses)) operation.$unset = { completed: 1 };

    await Enrollment.updateOne(
      { _id: enrollment._id, updated: previousUpdated || { $exists: false } },
      operation,
    );

    return Enrollment.findById(enrollment._id)
      .populate({ path: "course", populate: { path: "instructor", select: "_id name" } })
      .populate("student", "_id name");
  }

  return enrollment;
};

export default { findEnrollment, create, enrollmentByID, isStudent, read, listEnrolled };
