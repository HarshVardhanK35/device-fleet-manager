import express from "express";

import {
  createPlaylist,
  getAllPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
} from "../controllers/playlistController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createPlaylist);
router.get("/", protect, getAllPlaylists);
router.get("/:id", protect, getPlaylistById);
router.put("/:id", protect, updatePlaylist);
router.delete("/:id", protect, deletePlaylist);

export default router;
