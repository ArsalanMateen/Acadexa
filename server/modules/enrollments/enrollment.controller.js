import Enrollment from "./enrollment.model.js";
import Course from "../courses/course.model.js";
import errorHandler from "../../lib/dbErrorHandler.js";

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

export default { findEnrollment, create };
