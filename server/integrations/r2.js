import fs from "fs/promises";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import config from "../config/config.js";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

function getExtension(contentType) {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    default:
      throw new Error("Image must be PNG, JPG or WebP.");
  }
}

/**
 * Uploads a course image file to Cloudflare R2 and returns its public URL
 * @param {object} file - Formidable file object
 * @param {string} courseId - Course ID
 * @returns {Promise<string>} Public URL of uploaded image
 */
export const uploadCourseImage = async (file, courseId) => {
  if (!file || !file.path) {
    throw new Error("No file provided for upload");
  }

  if (
    !config.r2.publicUrl ||
    !config.r2.bucketName ||
    !config.r2.accountId ||
    !config.r2.accessKeyId ||
    !config.r2.secretAccessKey
  ) {
    throw new Error("Course image storage is not configured.");
  }

  const fileData = await fs.readFile(file.path);

  if (fileData.length > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB.");

  const contentType = file.type;
  const ext = getExtension(contentType);
  const key = `courses/${courseId}-${Date.now()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: fileData,
      ContentType: contentType,
    }),
  );

  const baseUrl = (config.r2.publicUrl || "").replace(/\/$/, "");

  return `${baseUrl}/${key}`;
};

/**
 * Deletes an image from Cloudflare R2 if it belongs to our bucket
 * @param {string} imageUrl - Public URL of image to delete
 */
export const deleteCourseImage = async (imageUrl) => {
  if (!imageUrl) return;

  const baseUrl = (config.r2.publicUrl || "").replace(/\/$/, "");

  if (!baseUrl || typeof imageUrl !== "string" || !imageUrl.startsWith(`${baseUrl}/courses/`)) {
    return;
  }

  const key = imageUrl.slice(baseUrl.length + 1);

  if (!key) return;

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: config.r2.bucketName,
        Key: key,
      }),
    );
  } catch (err) {
    console.error("Failed to delete previous image from R2:", err.message);
  }
};

export default {
  uploadCourseImage,
  deleteCourseImage,
};
