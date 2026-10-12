import express from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  getAllUsers,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
  deleteUser,
} from "../controllers/authController.js";

import { protect, requireAdmin } from "../middleware/auth.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

const emailActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

const router = express.Router();

router.post("/register", registerLimiter, register);
router.get("/users", protect, requireAdmin, getAllUsers);
router.post("/login", loginLimiter, login);
router.get("/me", protect, getMe);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", emailActionLimiter, resendVerification);
router.post("/forgot-password", emailActionLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.delete("/users/:id", protect, requireAdmin, deleteUser);

export default router;
