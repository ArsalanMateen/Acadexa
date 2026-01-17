import User from "../users/user.model.js";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import config from "../../config/config.js";

const signin = async (req, res) => {
  try {
    let user = await User.findOne({
      email: typeof req.body.email === "string" ? req.body.email.trim() : "",
    });

    if (!user) {
      return res.status("401").json({
        error: "User not found",
      });
    }

    if (!user.authenticate(req.body.password)) {
      return res.status("401").send({
        error: "Email and password don't match.",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      config.jwtSecret,
      { expiresIn: "7d", algorithm: "HS256" },
    );

    res.cookie("t", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: config.env === "production",
    });

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        instructor: Boolean(user.instructor),
      },
    });
  } catch {
    return res.status("401").json({
      error: "Could not sign in",
    });
  }
};

export default { signin };
