import User from "./user.model.js";
import Course from "../courses/course.model.js";
import Enrollment from "../enrollments/enrollment.model.js";
import r2Helper from "../../integrations/r2.js";
import mongoose from "mongoose";
import errorHandler from "../../lib/dbErrorHandler.js";

const create = async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });

  try {
    await user.save();

    return res.status(200).json({
      message: "Successfully signed up!",
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const list = async (req, res) => {
  try {
    let users = await User.find()
      .select("name instructor created")
      .lean()
      .exec();

    res.json(users);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const userByID = async (req, res, next, id) => {
  try {
    let user = await User.findById(id);

    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    req.profile = user;
    next();
  } catch {
    return res.status(400).json({
      error: "Could not retrieve user",
    });
  }
};

const read = (req, res) => {
  const profile = req.profile.toObject();

  delete profile.hashed_password;
  delete profile.salt;

  if (String(req.auth._id) !== String(req.profile._id)) delete profile.email;

  return res.json(profile);
};

const update = async (req, res) => {
  try {
    let user = req.profile;

    for (const field of ["name", "email", "password", "instructor"]) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        user[field] = req.body[field];
      }
    }

    user.updated = Date.now();

    await user.save();

    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const remove = async (req, res) => {
  let session;

  try {
    const user = req.profile;

    session = await mongoose.startSession();

    let courses;
    let deletedUser;

    await session.withTransaction(async () => {
      courses = await Course.find({ instructor: user._id }).session(session);

      const courseIds = courses.map((course) => course._id);

      await Enrollment.deleteMany(
        { $or: [{ student: user._id }, { course: { $in: courseIds } }] },
        { session },
      );
      await Course.deleteMany({ instructor: user._id }, { session });
      deletedUser = await User.findByIdAndDelete(user._id, { session });
    });
    await Promise.all(
      courses.map((course) => r2Helper.deleteCourseImage(course.image)),
    );

    if (!deletedUser) return res.status(404).json({ error: "User not found" });

    deletedUser.hashed_password = undefined;
    deletedUser.salt = undefined;
    res.json(deletedUser);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  } finally {
    if (session) await session.endSession();
  }
};

const isInstructor = (req, res, next) => {
  const isInstructor = req.profile.instructor;

  if (!isInstructor) {
    return res.status(403).json({
      error: "User is not an instructor",
    });
  }

  next();
};

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update,
  isInstructor,
};
