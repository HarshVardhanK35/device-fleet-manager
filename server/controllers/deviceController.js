import Device from "../models/Device.js";
import Assignment from "../models/Assignment.js";
import buildManifestForDevice from "../services/manifestService.js";
import { validationMessage } from "../utils/fieldLimits.js";
import {
  publishControlMessage,
  publishManifestToDevice,
} from "../services/mqttService.js";

export const createDevice = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      const count = await Device.countDocuments({ userId: req.user.id });
      if (count >= 3) {
        return res
          .status(403)
          .json({ message: "Screen limit reached (3 max)" });
      }
    }

    const device = await Device.create({ ...req.body, userId: req.user.id });
    res.status(201).json(device);
  } catch (error) {
    res.status(400).json({ message: validationMessage(error) });
  }
};

export const getAllDevices = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { userId: req.user.id };
    const devices = await Device.find(filter);
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: "Screen not found" });
    }
    if (req.user.role !== "admin" && device.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your screen" });
    }
    res.status(200).json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const connectDevice = async (req, res) => {
  try {
    const device = await Device.findOne({ accessToken: req.params.token });
    if (!device) {
      return res.status(404).json({ message: "Screen not found" });
    }

    const THRESHOLD_MS = 20000; // matches offlineChecker.js's own threshold
    const alreadyConnected =
      device.status === "online" &&
      Date.now() - device.lastSeenAt < THRESHOLD_MS;

    if (alreadyConnected) {
      return res.status(409).json({ message: "Screen already connected" });
    }

    device.status = "online";
    device.lastSeenAt = new Date();
    device.takenOver = false; // the physical screen is connected again
    await device.save();

    const manifest = await buildManifestForDevice(device._id);
    publishManifestToDevice(device._id, manifest);

    res.status(200).json({ connected: true, deviceId: device._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: "Screen not found" });
    }

    if (device.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your screen" });
    }

    Object.assign(device, req.body);
    await device.save();
    res.status(200).json(device);
  } catch (error) {
    res.status(400).json({ message: validationMessage(error) });
  }
};

export const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: "Screen not found" });
    }

    if (device.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your screen" });
    }

    // Its schedules go with it (otherwise they point at a screen that no longer exists).
    await Assignment.deleteMany({ deviceId: device._id });
    await device.deleteOne();
    res.status(200).json({ message: "Screen deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const takeOverDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: "Screen not found" });
    }

    if (device.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your screen" });
    }

    await Device.updateOne({ _id: device._id }, { $set: { takenOver: true } });
    publishControlMessage(device._id, { action: "disconnect" });
    res.status(200).json({ message: "Take-over signal sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const releaseDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: "Screen not found" });
    }

    if (device.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your screen" });
    }

    await Device.updateOne({ _id: device._id }, { $set: { takenOver: false } });
    publishControlMessage(device._id, { action: "reconnect" });
    res.status(200).json({ message: "Release signal sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const REFRESH_COOLDOWN_MS = 60 * 1000; // one "Refresh screen" per screen per minute

// POST /devices/:id/refresh — the owner asks a screen that is online to start
// its playlist again from the first item (it does not reload the page). Only
// while the screen is online; at most one per minute per screen, so a screen
// can't be restarted over and over (every restart also stops downloads in
// progress). Sends the current manifest first, then the "refresh" signal.
export const refreshDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: "Screen not found" });
    }

    if (device.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your screen" });
    }

    if (device.status !== "online") {
      return res.status(409).json({ message: "This screen is offline" });
    }

    const now = Date.now();
    const waitMs = REFRESH_COOLDOWN_MS - (now - (device.lastRefreshAt?.getTime() || 0));
    if (waitMs > 0) {
      const retryInSeconds = Math.ceil(waitMs / 1000);
      return res
        .status(429)
        .json({ message: `Try again in ${retryInSeconds} s`, retryInSeconds });
    }

    // Claim the minute in one update, so two quick clicks can't both go through.
    const claimed = await Device.updateOne(
      {
        _id: device._id,
        $or: [
          { lastRefreshAt: { $exists: false } },
          { lastRefreshAt: { $lte: new Date(now - REFRESH_COOLDOWN_MS) } },
        ],
      },
      { $set: { lastRefreshAt: new Date(now) } },
    );
    if (claimed.modifiedCount === 0) {
      return res.status(429).json({ message: "Try again in a moment", retryInSeconds: 5 });
    }

    const manifest = await buildManifestForDevice(device._id);
    publishManifestToDevice(device._id, manifest);
    publishControlMessage(device._id, { action: "refresh" });
    res.status(200).json({
      message: "Refresh signal sent",
      retryInSeconds: REFRESH_COOLDOWN_MS / 1000,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deviceExists = async (req, res) => {
  try {
    const device = await Device.findOne({ accessToken: req.params.token })
      .select("name")
      .lean();
    if (!device) {
      return res.status(404).json({ exists: false });
    }

    // The name is sent too, so a screen shows the current name after a rename.
    res.status(200).json({ exists: true, name: device.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unpairDevice = async (req, res) => {
  try {
    const device = await Device.findOne({ accessToken: req.params.token });
    if (!device) {
      return res.status(404).json({ message: "Screen not found" });
    }

    await Assignment.deleteMany({ deviceId: device._id });
    await device.deleteOne();

    res.status(200).json({ message: "Screen deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const disconnectDevice = async (req, res) => {
  try {
    const device = await Device.findOne({ accessToken: req.params.token });
    if (!device) {
      return res.status(404).json({ message: "Screen not found" });
    }

    device.status = "offline";
    device.lastSeenAt = null;
    await device.save();

    res.status(200).json({ disconnected: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
