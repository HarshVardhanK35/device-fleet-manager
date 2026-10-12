import Content from "../models/Content.js";
import Playlist from "../models/Playlist.js";
import Assignment from "../models/Assignment.js";
import buildManifestForDevice from "../services/manifestService.js";
import { publishManifestToDevice } from "../services/mqttService.js";

async function pushManifest(deviceId) {
  const manifest = await buildManifestForDevice(deviceId);
  publishManifestToDevice(deviceId, manifest);
}

const MAX_IMAGES = 30;
const MAX_VIDEO_BYTES = 150 * 1024 * 1024; // 150MB

export const createContent = async (req, res) => {
  try {
    const { type, durationInMillis, sizeBytes } = req.body;

    if (type === "app" && !durationInMillis) {
      return res
        .status(400)
        .json({ message: "durationInMillis is required for type 'app'" });
    }

    if (type === "image" && !durationInMillis) {
      req.body.durationInMillis = 30000;
    }

    if (type === "image") {
      const imageCount = await Content.countDocuments({
        userId: req.user.id,
        type: "image",
      });
      if (imageCount >= MAX_IMAGES) {
        return res.status(403).json({
          message: `Image limit reached (${MAX_IMAGES} max)`,
        });
      }
    }

    if (type === "video") {
      const videos = await Content.find({ userId: req.user.id, type: "video" });
      const usedBytes = videos.reduce((sum, v) => sum + (v.sizeBytes || 0), 0);
      if (usedBytes + (sizeBytes || 0) > MAX_VIDEO_BYTES) {
        return res.status(403).json({
          message: "Video storage limit reached (150MB max)",
        });
      }
    }

    const content = await Content.create({ ...req.body, userId: req.user.id });
    res.status(201).json(content);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllContent = async (req, res) => {
  try {
    const contents = await Content.find({ userId: req.user.id });
    res.status(200).json(contents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (content.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your content" });
    }

    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (content.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your content" });
    }

    Object.assign(content, req.body);
    await content.save();

    const playlists = await Playlist.find({ contentItems: content._id });
    const playlistIds = playlists.map((p) => p._id);

    const assignments = await Assignment.find({
      playlistId: { $in: playlistIds },
    });

    const deviceIds = [
      ...new Set(assignments.map((a) => a.deviceId.toString())),
    ];
    await Promise.all(deviceIds.map((id) => pushManifest(id)));

    res.status(200).json(content);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (content.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your content" });
    }

    await content.deleteOne();
    res.status(200).json({ message: "Content deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
