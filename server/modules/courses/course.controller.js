import Course from "./course.model.js";
import errorHandler from "../../lib/dbErrorHandler.js";
import formidable from "formidable";

const parseCourseForm = (req, res, edit = false) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (error, fields, files) => {
    try {
      if (error) throw error;
      const course = edit ? req.course : new Course({ instructor: req.profile._id });
      for (const field of ["name", "description", "category", "published"]) {
        if (Object.prototype.hasOwnProperty.call(fields, field)) course[field] = fields[field];
      }
      
      course.updated = new Date();
      await course.validate();
      
      const result = await course.save();
      await result.populate("instructor", "_id name").execPopulate();
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
    }
  });
};

const create = (req, res) => parseCourseForm(req, res);

const listByInstructor = async (req, res) => {
  try {
    let courses = await Course.find({ instructor: req.profile._id })
      .populate("instructor", "_id name")
      .lean()
      .exec();

    res.json(courses);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const courseByID = async (req, res, next, id) => {
  try {
    let course = await Course.findById(id).populate("instructor", "_id name instructor");

    if (!course) {
      return res.status(400).json({
        error: "Course not found",
      });
    }

    req.course = course;
    next();
  } catch {
    return res.status(400).json({
      error: "Could not retrieve course",
    });
  }
};

const read = (req, res) => {
  const isOwner = req.auth && String(req.course.instructor?._id || req.course.instructor) === String(req.auth._id);
  if (!req.course.published && !isOwner) return res.status(404).json({ error: "Course not found" });
  return res.json(req.course);
};

const isInstructor = (req, res, next) => {
  const isInstructor =
    req.course &&
    req.auth &&
    req.course.instructor &&
    String(req.course.instructor._id || req.course.instructor) === String(req.auth._id);

  if (!isInstructor) {
    return res.status(403).json({
      error: "User is not authorized",
    });
  }

  next();
};

const update = (req, res) => parseCourseForm(req, res, true);

export default { create, listByInstructor, courseByID, read, isInstructor, update };
