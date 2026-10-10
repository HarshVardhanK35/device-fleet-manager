import Device from "../models/Device.js";

export const createDevice = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      const count = await Device.countDocuments({ userId: req.user.id });
      if (count >= 3) {
        return res
          .status(403)
          .json({ message: "Device limit reached (3 max)" });
      }
    }

    const device = await Device.create({ ...req.body, userId: req.user.id });
    res.status(201).json(device);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
      return res.status(404).json({ message: "Device not found" });
    }
    res.status(200).json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const connectDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const THRESHOLD_MS = 20000; // matches offlineChecker.js's own threshold
    const alreadyConnected =
      device.status === "online" &&
      Date.now() - device.lastSeenAt < THRESHOLD_MS;

    if (alreadyConnected) {
      return res.status(409).json({ message: "Device already connected" });
    }

    device.status = "online";
    device.lastSeenAt = new Date();
    await device.save();

    res.status(200).json({ connected: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    if (device.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your device" });
    }

    Object.assign(device, req.body);
    await device.save();
    res.status(200).json(device);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    if (device.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your device" });
    }
    
    await device.deleteOne();
    res.status(200).json({ message: "Device deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
