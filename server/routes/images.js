// routes/images.js
import express from "express";
import upload from "../middleware/multer.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Upload single inline image
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Create a data URI from the buffer
    const fileStr = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const result = await uploadToCloudinary(fileStr, {
      folder: "notes/images",
      resource_type: "auto",
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Inline Image Upload Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
