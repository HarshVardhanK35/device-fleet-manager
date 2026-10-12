import Content from "../models/Content.js";
import Playlist from "../models/Playlist.js";
import Assignment from "../models/Assignment.js";
import buildManifestForDevice from "../services/manifestService.js";
import { publishManifestToDevice } from "../services/mqttService.js";

async function pushManifest(deviceId) {
  const manifest = await buildManifestForDevice(deviceId);
  publishManifestToDevice(deviceId, manifest);
}

export const createContent = async (req, res) => {
  try {
    const { type, durationInMillis } = req.body;

    if (type === "app" && !durationInMillis) {
      return res
        .status(400)
        .json({ message: "durationInMillis is required for type 'app'" });
    }
    if (type === "image" && !durationInMillis) {
      req.body.durationInMillis = 30000;
    }
    const content = await Content.create(req.body);
    res.status(201).json(content);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllContent = async (req, res) => {
  try {
    const contents = await Content.find();
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
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

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
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.status(200).json({ message: "Content deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
