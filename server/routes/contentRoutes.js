import express from "express";
import {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
} from "../controllers/contentController.js";

// express.Router() creates a mini, self-contained instance of Express's routing system 
const router = express.Router();

// express.Router():
// lets define routes in a separate file instead of piling all into index.js (main)
// then plug it into app later with app.use().
router.post("/", createContent);
router.get("/", getAllContent);
router.get("/:id", getContentById);
router.put("/:id", updateContent);
router.delete("/:id", deleteContent);

export default router;
