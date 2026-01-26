import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: true,
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  lessonStatus: [
    {
      lesson: {
        type: mongoose.Schema.ObjectId,
      },
      complete: {
        type: Boolean,
        default: false,
      },
    },
  ],
  enrolled: {
    type: Date,
    default: Date.now,
  },
  updated: Date,
  completed: Date,
});

EnrollmentSchema.index({ course: 1, student: 1 }, { unique: true });
EnrollmentSchema.index({ student: 1, completed: 1 });

export default mongoose.model("Enrollment", EnrollmentSchema);
