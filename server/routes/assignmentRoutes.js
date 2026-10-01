import express from "express";
import {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignments,
  deleteAssignment,
} from "../controllers/assignmentController.js";

import { protect } from "../middleware/auth.js";

// express.Router() creates a mini, self-contained instance of Express's routing system
const router = express.Router();

// express.Router():
// lets define routes in a separate file instead of piling all into index.js (main)
// then plug it into app later with app.use().
router.post("/", protect, createAssignment);
router.get("/", protect, getAllAssignments);
router.get("/:id", protect, getAssignmentById);
router.put("/:id", protect, updateAssignments);
router.delete("/:id", protect, deleteAssignment);

export default router;
