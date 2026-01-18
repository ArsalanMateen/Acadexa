import User from "./user.model.js";
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

export default { create, userByID, read, update };
