import Playlist from "../models/Playlist.js";
import Content from "../models/Content.js";
import Assignment from "../models/Assignment.js";
import buildManifestForDevice from "../services/manifestService.js";
import { publishManifestToDevice } from "../services/mqttService.js";

async function pushManifest(deviceId) {
  const manifest = await buildManifestForDevice(deviceId);
  publishManifestToDevice(deviceId, manifest);
}

export const createPlaylist = async (req, res) => {
  try {
    const contentIds = req.body.contentItems || [];
    const ownedCount = await Content.countDocuments({
      _id: { $in: contentIds },
      userId: req.user.id,
    });

    if (ownedCount !== contentIds.length) {
      return res.status(403).json({ message: "Invalid content selection" });
    }

    const playlist = await Playlist.create({
      ...req.body,
      userId: req.user.id,
    });
    
    await playlist.populate("contentItems");
    res.status(201).json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id }).populate(
      "contentItems",
    );
    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate(
      "contentItems",
    );

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your playlist" });
    }
    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    
    if (playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your playlist" });
    }

    if (req.body.contentItems) {
      const ownedCount = await Content.countDocuments({
        _id: { $in: req.body.contentItems },
        userId: req.user.id,
      });
      if (ownedCount !== req.body.contentItems.length) {
        return res.status(403).json({ message: "Invalid content selection" });
      }
    }

    Object.assign(playlist, req.body);
    await playlist.save();
    await playlist.populate("contentItems");

    const assignments = await Assignment.find({ playlistId: playlist._id });
    const deviceIds = [
      ...new Set(assignments.map((a) => a.deviceId.toString())),
    ];
    await Promise.all(deviceIds.map((id) => pushManifest(id)));

    res.status(200).json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    
    if (playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your playlist" });
    }
    await playlist.deleteOne();
    res.status(200).json({ message: "Playlist deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
