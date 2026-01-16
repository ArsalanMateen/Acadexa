import mongoose from "mongoose";
import crypto from "crypto";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Name is required",
  },
  email: {
    type: String,
    trim: true,
    unique: "Email already exists",
    match: [/.+@.+\..+/, "Please fill a valid email address"],
    required: "Email is required",
  },
  hashed_password: {
    type: String,
    required: "Password is required",
  },
  salt: String,
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

UserSchema.path("hashed_password").validate(function () {
  if (this._password && this._password.length < 6) {
    this.invalidate("password", "Password must be at least 6 characters.");
  }
  if (this.isNew && !this._password) {
    this.invalidate("password", "Password is required");
  }
}, null);

UserSchema.methods = {
  authenticate: function (plainText) {
    if (typeof plainText !== "string" || !this.hashed_password) return false;

    try {
      const actual = `scrypt:${crypto.scryptSync(plainText, this.salt, 64).toString("hex")}`;
      const expectedBytes = Buffer.from(this.hashed_password);
      const actualBytes = Buffer.from(actual);

      return (
        expectedBytes.length === actualBytes.length &&
        crypto.timingSafeEqual(expectedBytes, actualBytes)
      );
    } catch {
      return false;
    }
  },

  encryptPassword: function (password) {
    if (!password) return "";

    try {
      return `scrypt:${crypto.scryptSync(password, this.salt, 64).toString("hex")}`;
    } catch {
      return "";
    }
  },

  makeSalt: function () {
    return crypto.randomBytes(16).toString("hex");
  },
};

export default mongoose.model("User", UserSchema);
