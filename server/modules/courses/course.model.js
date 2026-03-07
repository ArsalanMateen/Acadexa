import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: "Lesson title is required" },
  content: String,
  resource_url: String,
});

const Lesson = mongoose.model("Lesson", LessonSchema);

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Name is required",
  },
  description: {
    type: String,
    trim: true,
  },
  image: { type: String, default: "" },
  category: {
    type: String,
    required: "Category is required",
  },
  published: {
    type: Boolean,
    default: false,
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  lessons: [LessonSchema],
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
});


CourseSchema.index({ published: 1, created: -1, _id: -1 });
CourseSchema.index({ instructor: 1 });

const Course = mongoose.model("Course", CourseSchema);

export { Lesson };

export default Course;
