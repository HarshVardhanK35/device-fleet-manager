import Assignment from "../models/Assignment.js";
import Device from "../models/Device.js";
import Playlist from "../models/Playlist.js";
import buildManifestForDevice from "../services/manifestService.js";
import { publishManifestToDevice } from "../services/mqttService.js";

async function pushManifest(deviceId) {
  const manifest = await buildManifestForDevice(deviceId);
  publishManifestToDevice(deviceId, manifest);
}

export const createAssignment = async (req, res) => {
  try {
    const device = await Device.findById(req.body.deviceId);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const isOwner = device.userId && req.user.id === device.userId.toString();
    if (!isOwner) {
      return res.status(403).json({
        message: "You don't have permission to publish to this device",
      });
    }

    const playlist = await Playlist.findById(req.body.playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to use this playlist",
      });
    }

    const assignment = await Assignment.create(req.body);
    await pushManifest(device._id);
    res.status(201).json(assignment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllAssignments = async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user.id });
    const deviceIds = devices.map((d) => d._id);

    const assignments = await Assignment.find({ deviceId: { $in: deviceIds } })
      .populate("deviceId")
      .populate({ path: "playlistId", populate: { path: "contentItems" } });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("deviceId")
      .populate({ path: "playlistId", populate: { path: "contentItems" } });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (
      !assignment.deviceId ||
      assignment.deviceId.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not your assignment" });
    }

    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAssignments = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const device = await Device.findById(assignment.deviceId);
    if (!device || device.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your device's assignment" });
    }

    if (req.body.playlistId) {
      const playlist = await Playlist.findById(req.body.playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      if (playlist.userId.toString() !== req.user.id) {
        return res.status(403).json({
          message: "You don't have permission to use this playlist",
        });
      }
    }

    Object.assign(assignment, req.body);
    await assignment.save();
    await pushManifest(device._id);
    res.status(200).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const device = await Device.findById(assignment.deviceId);
    if (!device || device.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your device's assignment" });
    }

    await assignment.deleteOne();
    await pushManifest(device._id);
    res.status(200).json({ message: "Assignment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
