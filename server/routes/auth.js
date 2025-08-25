import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  // Check password against environment variable
  if (password !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: "Invalid password" });
  }

  // Create JWT token
  const token = jwt.sign(
    { isAdmin: true },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "24h" }
  );

  res.json({ token });
});

export default router;
