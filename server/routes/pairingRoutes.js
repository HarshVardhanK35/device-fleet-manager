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
  message: { message: "Too many requests. Please try again later." },
});

const router = express.Router();

router.post("/generate", generateCodeLimiter, generateCode);
router.get("/:code/status", getCodeStatus);
router.post("/:code/claim", protect, claimCode);

export default router;
