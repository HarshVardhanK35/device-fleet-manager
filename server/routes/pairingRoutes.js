import express from "express";
import rateLimit from "express-rate-limit";

import {
  generateCode,
  getCodeStatus,
  claimCode,
} from "../controllers/pairingController.js";
import { protect } from "../middleware/auth.js";

const generateCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  // The reply carries the moment the limit resets, so a screen can show the
  // exact time and wait for it instead of retrying.
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests. Please try again later.",
      retryAt: req.rateLimit?.resetTime,
    });
  },
});

const router = express.Router();

router.post("/generate", generateCodeLimiter, generateCode);
router.get("/:code/status", getCodeStatus);
router.post("/:code/claim", protect, claimCode);

export default router;
