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

export default { create };
