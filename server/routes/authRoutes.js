import express from "express";

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
} from "../controllers/authController.js";

import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.get("/users", protect, requireAdmin, getAllUsers);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
