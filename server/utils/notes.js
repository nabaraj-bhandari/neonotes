// utils/notes.js

import { deleteFromCloudinary } from "../config/cloudinary.js";

const adminAuth = (req, res, next) => {
  const pass = req.headers["x-admin-pass"];
  if (!pass || pass.trim() === "") {
    return res.status(401).json({ error: "Admin password required" });
  }
  if (pass !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: "Invalid admin password" });
  }
  return next();
};

const getPublicId = (url) => {
  try {
    if (!url.includes("notes")) return null;
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    const folder = parts.slice(parts.indexOf("notes"), -1).join("/");
    return `${folder}/${filename.split(".")[0]}`;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

const extractImageUrls = (text) => {
  const regex =
    /(https?:\/\/res\.cloudinary\.com\/[^"'\s>]+\/notes\/images\/[^"'\s>]+)/g;
  return text.match(regex) || [];
};

const deleteFilesFromCloudinary = async (urls = []) => {
  await Promise.all(
    urls.map(async (url) => {
      // Handle both string URLs and {url, title} objects
      const fileUrl = typeof url === "string" ? url : url.url;
      const publicId = getPublicId(fileUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    })
  );
};

const diffImageUrls = (oldContent, newContent) => {
  const oldImages = extractImageUrls(oldContent || "");
  const newImages = extractImageUrls(newContent || "");
  return oldImages.filter((url) => !newImages.includes(url));
};

const parseArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
};

export {
  adminAuth,
  getPublicId,
  extractImageUrls,
  deleteFilesFromCloudinary,
  diffImageUrls,
  parseArray,
};
