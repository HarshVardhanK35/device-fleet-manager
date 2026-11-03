import express from "express";

import {
  listUsers,
  listUserScreens,
} from "../controllers/adminController.js";
import { deleteUser } from "../controllers/authController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Every admin route needs a valid token AND the admin role.
router.use(protect, requireAdmin);

router.get("/users", listUsers);
router.get("/users/:id/screens", listUserScreens);
router.delete("/users/:id", deleteUser);

export default router;
