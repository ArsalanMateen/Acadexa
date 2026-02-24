import crypto from "node:crypto";
import mongoose from "mongoose";
import config from "../../config/config.js";

const scope = "published:newest";

const sign = (payload) =>
  crypto
    .createHmac("sha256", config.jwtSecret)
    .update(JSON.stringify(payload))
    .digest("base64url");

export function encodeCourseCursor(course) {
  const payload = {
    v: 1,
    scope,
    created: new Date(course.created).toISOString(),
    id: String(course._id),
  };

  return Buffer.from(
    JSON.stringify({ ...payload, signature: sign(payload) }),
  ).toString("base64url");
}

export function publishedCourseCard(course) {
  return {
    _id: course._id,
    name: course.name,
    description: course.description,
    category: course.category,
    image: course.image,
    instructor: course.instructor,
    lessonCount: course.lessons.length,
  };
}

export function publishedQuery(params = {}) {
  const rawLimit = params.limit;

  if (
    rawLimit !== undefined &&
    (typeof rawLimit !== "string" || !/^[1-9]\d*$/.test(rawLimit))
  ) {
    throw new Error("Limit must be an integer between 1 and 50.");
  }

  const limit = rawLimit === undefined ? 12 : Number(rawLimit);

  if (!Number.isSafeInteger(limit) || limit > 50) {
    throw new Error("Limit must be an integer between 1 and 50.");
  }

  const filter = { published: true };

  if (params.cursor !== undefined) {
    try {
      const raw = params.cursor;

      if (
        typeof raw !== "string" ||
        raw.length > 512 ||
        !/^[A-Za-z0-9_-]+$/.test(raw)
      ) {
        throw new Error();
      }

      const decoded = Buffer.from(raw, "base64url");

      if (decoded.toString("base64url") !== raw) throw new Error();

      const cursor = JSON.parse(decoded.toString("utf8"));

      if (
        cursor.v !== 1 ||
        cursor.scope !== scope ||
        typeof cursor.created !== "string" ||
        typeof cursor.id !== "string" ||
        !/^[a-f\d]{24}$/i.test(cursor.id) ||
        typeof cursor.signature !== "string"
      ) {
        throw new Error();
      }

      const created = new Date(cursor.created);

      if (
        !Number.isFinite(created.getTime()) ||
        created.toISOString() !== cursor.created
      ) {
        throw new Error();
      }

      const expected = sign({
        v: cursor.v,
        scope: cursor.scope,
        created: cursor.created,
        id: cursor.id,
      });
      const signature = Buffer.from(cursor.signature);

      if (
        signature.length !== expected.length ||
        !crypto.timingSafeEqual(signature, Buffer.from(expected))
      ) {
        throw new Error();
      }

      filter.$or = [
        { created: { $lt: created } },
        { created, _id: { $lt: mongoose.Types.ObjectId(cursor.id) } },
      ];
    } catch {
      throw new Error("Invalid or incompatible course cursor.");
    }
  }

  return { filter, limit, initial: params.cursor === undefined };
}
