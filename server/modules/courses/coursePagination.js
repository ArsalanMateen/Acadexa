import crypto from "node:crypto";
import mongoose from "mongoose";
import config from "../../config/config.js";

const scope = "published:newest";

const sign = (payload) =>
  crypto.createHmac("sha256", config.jwtSecret).update(JSON.stringify(payload)).digest("base64url");

export function encodeCourseCursor(course) {
  const payload = {
    v: 1,
    scope,
    created: new Date(course.created).toISOString(),
    id: String(course._id),
  };

  return Buffer.from(JSON.stringify({ ...payload, signature: sign(payload) })).toString(
    "base64url",
  );
}

export function publishedCourseCard(course) {
  return {
    _id: course._id,
    name: course.name,
    description: course.description,
    category: course.category,
    image: course.image,
    instructor: course.instructor,
    lessonCount: Array.isArray(course.lessons) ? course.lessons.length : 0,
  };
}

export function publishedQuery(params = {}) {
  const rawLimit = params.limit;

  if (rawLimit !== undefined && (typeof rawLimit !== "string" || !/^[1-9]\d*$/.test(rawLimit))) {
    throw new Error("Limit must be an integer between 1 and 50.");
  }

  const limit = rawLimit === undefined ? 12 : Number(rawLimit);

  if (!Number.isSafeInteger(limit) || limit > 50) {
    throw new Error("Limit must be an integer between 1 and 50.");
  }

  const filter = { published: true };

  return { filter, limit, initial: params.cursor === undefined };
}
