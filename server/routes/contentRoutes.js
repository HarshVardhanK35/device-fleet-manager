import express from "express";
import {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
} from "../controllers/contentController.js";

import { protect } from "../middleware/auth.js";

// express.Router() creates a mini, self-contained instance of Express's routing system 
const router = express.Router();

// express.Router():
// lets define routes in a separate file instead of piling all into index.js (main)
// then plug it into app later with app.use().
router.post("/", protect, createContent);
router.get("/", protect, getAllContent);
router.get("/:id", protect, getContentById);
router.put("/:id", protect, updateContent);
router.delete("/:id", protect, deleteContent);

export default router;
