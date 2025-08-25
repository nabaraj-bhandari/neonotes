// routes/images.js
import express from "express";
import upload from "../middleware/multer.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { adminAuth } from "../utils/notes.js";

const router = express.Router();

// Upload single inline image
router.post("/", adminAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await uploadToCloudinary(req.file.path, "notes/images");

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Inline Image Upload Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
