import Playlist from "../models/Playlist.js";
import Content from "../models/Content.js";
import Assignment from "../models/Assignment.js";
import buildManifestForDevice from "../services/manifestService.js";
import { validationMessage } from "../utils/fieldLimits.js";
import { publishManifestToDevice } from "../services/mqttService.js";

// Sends a screen its fresh manifest. A problem with one screen must never fail
// the edit that triggered it: an assignment whose screen was deleted is cleaned
// up, and anything else is only logged.
async function pushManifest(deviceId) {
  try {
    const manifest = await buildManifestForDevice(deviceId);
    publishManifestToDevice(deviceId, manifest);
  } catch (err) {
    if (err.message === "Device not found!") {
      await Assignment.deleteMany({ deviceId });
      return;
    }
    console.error("Could not push the manifest to a screen:", err.message);
  }
}

// Two playlists of one account can't share a name (capitals and extra spaces don't
// count as a difference). `exceptId` is the playlist being renamed.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
async function nameTaken(userId, name, exceptId) {
  const clean = String(name || "").trim().replace(/\s+/g, " ");
  if (!clean) return false;
  const pattern = escapeRegex(clean).replace(/ /g, "\\s+");
  const found = await Playlist.findOne({
    userId,
    name: { $regex: `^\\s*${pattern}\\s*$`, $options: "i" },
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  })
    .select("_id")
    .lean();
  return !!found;
}
const NAME_TAKEN_MESSAGE = "You already have a playlist with this name.";

// An image may appear in a playlist up to 3 times; any other content once.
const MAX_IMAGE_COPIES = 3;

// Returns an error message when the list breaks that rule, otherwise null.
async function duplicateRuleError(contentIds) {
  const ids = contentIds.map(String);
  const docs = await Content.find({ _id: { $in: [...new Set(ids)] } })
    .select("type")
    .lean();
  const typeById = new Map(docs.map((d) => [String(d._id), d.type]));
  const counts = new Map();
  for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
  for (const [id, n] of counts) {
    const cap = typeById.get(id) === "image" ? MAX_IMAGE_COPIES : 1;
    if (n > cap) {
      return `An image can be added up to ${MAX_IMAGE_COPIES} times; other content only once`;
    }
  }
  return null;
}

export const createPlaylist = async (req, res) => {
  try {
    const contentIds = req.body.contentItems || [];
    const ownedCount = await Content.countDocuments({
      _id: { $in: contentIds },
      userId: req.user.id,
    });

    if (ownedCount !== new Set(contentIds.map(String)).size) {
      return res.status(403).json({ message: "Invalid content selection" });
    }

    const ruleError = await duplicateRuleError(contentIds);
    if (ruleError) return res.status(400).json({ message: ruleError });

    if (await nameTaken(req.user.id, req.body.name)) {
      return res.status(409).json({ message: NAME_TAKEN_MESSAGE });
    }

    const playlist = await Playlist.create({
      ...req.body,
      userId: req.user.id,
    });
    
    await playlist.populate("contentItems");
    res.status(201).json(playlist);
  } catch (error) {
    res.status(400).json({ message: validationMessage(error) });
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
      if (ownedCount !== new Set(req.body.contentItems.map(String)).size) {
        return res.status(403).json({ message: "Invalid content selection" });
      }

      const ruleError = await duplicateRuleError(req.body.contentItems);
      if (ruleError) return res.status(400).json({ message: ruleError });
    }

    if (req.body.name !== undefined && (await nameTaken(req.user.id, req.body.name, playlist._id))) {
      return res.status(409).json({ message: NAME_TAKEN_MESSAGE });
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
    res.status(400).json({ message: validationMessage(error) });
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
