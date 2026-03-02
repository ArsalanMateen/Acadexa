import Course from "./course.model.js";
import errorHandler from "../../lib/dbErrorHandler.js";
import formidable from "formidable";
import { publishedQuery, encodeCourseCursor, publishedCourseCard } from "./coursePagination.js";
import r2Helper from "../../integrations/r2.js";
import fs from "fs/promises";

const parseCourseForm = (req, res, edit = false) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.maxFileSize = 5 * 1024 * 1024;

  const temporaryFiles = new Set();
  form.on("fileBegin", (name, file) => temporaryFiles.add(file));

  form.parse(req, async (parseError, fields, files) => {
    let uploadedImage;
    let saved = false;

    try {
      if (parseError) {
        throw new Error("Image must be a PNG, JPG or WebP file under 5 MB.");
      }

      const course = edit ? req.course : new Course({ instructor: req.profile._id });
      const previousImage = course.image;

      for (const field of ["name", "description", "category", "published"]) {
        if (Object.prototype.hasOwnProperty.call(fields, field)) {
          course[field] = fields[field];
        }
      }

      if (Object.prototype.hasOwnProperty.call(fields, "lessons")) {
        const lessons =
          typeof fields.lessons === "string" ? JSON.parse(fields.lessons) : fields.lessons;

        if (!Array.isArray(lessons)) throw new Error("Lessons must be an array.");

        const existingIds = new Set(course.lessons.map((lesson) => String(lesson._id)));
        const seen = new Set();

        course.lessons = lessons.map((lesson) => {
          if (!lesson || typeof lesson.title !== "string" || !lesson.title.trim()) {
            throw new Error("Each lesson needs a title.");
          }
          if (
            lesson._id &&
            (!existingIds.has(String(lesson._id)) || seen.has(String(lesson._id)))
          ) {
            throw new Error("Invalid or duplicate lesson ID.");
          }
          if (lesson._id) seen.add(String(lesson._id));

          return {
            ...(lesson._id ? { _id: lesson._id } : {}),
            title: lesson.title,
            content: lesson.content,
            resource_url: lesson.resource_url,
          };
        });
      }

      course.updated = new Date();

      await course.validate();

      if (files.image?.size > 0) {
        uploadedImage = await r2Helper.uploadCourseImage(files.image, course._id);

        course.image = uploadedImage;
      }

      const result = await course.save();
      saved = true;

      await result.populate("instructor", "_id name").execPopulate();

      if (uploadedImage && previousImage) await r2Helper.deleteCourseImage(previousImage);

      return res.json(result);
    } catch (error) {
      if (uploadedImage && !saved) await r2Helper.deleteCourseImage(uploadedImage);

      return res.status(400).json({ error: errorHandler.getErrorMessage(error) });
    } finally {
      await Promise.all(
        [...temporaryFiles, ...Object.values(files || {})].map(
          (file) => file.path && fs.unlink(file.path).catch(() => {}),
        ),
      );
    }
  });
};

const create = (req, res) => parseCourseForm(req, res);

const listByInstructor = async (req, res) => {
  try {
    let courses = await Course.find({ instructor: req.profile._id })
      .select("-lessons.content -lessons.resource_url")
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
  const isOwner =
    req.auth &&
    req.course.instructor &&
    String(req.course.instructor._id || req.course.instructor) === String(req.auth._id);

  if (!req.course.published && !isOwner) {
    return res.status(404).json({ error: "Course not found" });
  }
  if (isOwner) return res.json(req.course);

  const course = req.course.toObject();
  course.lessons = course.lessons.map(({ _id, title }) => ({ _id, title }));

  return res.json(course);
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

const listPublished = async (req, res) => {
  let query;

  try {
    query = publishedQuery(req.query);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    // Fail explicitly for legacy records instead of silently losing them at a page boundary.
    if (
      query.initial &&
      (await Course.exists({ published: true, $expr: { $ne: [{ $type: "$created" }, "date"] } }))
    ) {
      return res.status(409).json({
        error:
          "The catalog contains courses with missing creation dates. Please contact the administrator.",
      });
    }

    const [rows, totalCount] = await Promise.all([
      Course.find(query.filter)
        .select("_id name description category image instructor created lessons._id")
        .sort({ created: -1, _id: -1 })
        .limit(query.limit + 1)
        .populate("instructor", "_id name")
        .lean()
        .exec(),
      query.initial ? Course.countDocuments({ published: true }) : Promise.resolve(null),
    ]);

    const hasMore = rows.length > query.limit;
    const courses = rows.slice(0, query.limit);

    return res.json({
      courses: courses.map(publishedCourseCard),
      totalCount,
      hasMore,
      nextCursor: hasMore ? encodeCourseCursor(courses[courses.length - 1]) : null,
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const newLesson = async (req, res) => {
  try {
    let lesson = req.body.lesson;

    if (!lesson || typeof lesson.title !== "string" || !lesson.title.trim()) {
      return res.status(400).json({ error: "Lesson title is required." });
    }

    let result = await Course.findByIdAndUpdate(
      req.course._id,
      { $push: { lessons: lesson }, updated: Date.now() },
      { new: true, runValidators: true },
    )
      .populate("instructor", "_id name")
      .exec();

    res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

export default { create, listByInstructor, courseByID, read, isInstructor, update, listPublished, newLesson };
