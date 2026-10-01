import express from "express";

import { register, login, getAllUsers } from "../controllers/authController.js";

import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.get("/users", protect, requireAdmin, getAllUsers);
router.post("/login", login);

export default router;
