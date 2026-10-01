import express from "express";

import {
  createPlaylist,
  getAllPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
} from "../controllers/playlistController.js";

const router = express.Router();

router.post("/", createPlaylist);
router.get("/", getAllPlaylists);
router.get("/:id", getPlaylistById);
router.put("/:id", updatePlaylist);
router.delete("/:id", deletePlaylist);

export default router;
