import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: "Name is required" },
  description: { type: String, trim: true },
  category: { type: String, required: "Category is required" },
  published: { type: Boolean, default: false },
  instructor: { type: mongoose.Schema.ObjectId, ref: "User" },
  updated: Date,
  created: { type: Date, default: Date.now },
});

export default mongoose.model("Course", CourseSchema);
