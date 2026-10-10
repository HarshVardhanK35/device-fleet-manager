import PairingCode from "../models/PairingCode.js";
import Device from "../models/Device.js";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRandomCode() {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export const generateCode = async (req, res) => {
  try {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    let pairingCode;
    while (!pairingCode) {
      try {
        pairingCode = await PairingCode.create({
          code: generateRandomCode(),
          expiresAt,
        });
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }

    res
      .status(201)
      .json({ code: pairingCode.code, expiresAt: pairingCode.expiresAt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCodeStatus = async (req, res) => {
  try {
    const pairingCode = await PairingCode.findOne({
      code: req.params.code,
    }).populate("deviceId");

    if (!pairingCode) {
      return res.status(404).json({ message: "Code not found or expired" });
    }

    if (pairingCode.status === "pending") {
      return res.status(200).json({ status: "pending" });
    }

    res.status(200).json({
      status: "claimed",
      deviceId: pairingCode.deviceId?._id,
      screenName: pairingCode.deviceId?.name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const claimCode = async (req, res) => {
  try {
    const { name, type } = req.body;
    const pairingCode = await PairingCode.findOne({ code: req.params.code });

    if (!pairingCode || pairingCode.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Invalid or already-claimed code" });
    }

    if (pairingCode.expiresAt <= new Date()) {
      return res.status(400).json({ message: "Code has expired" });
    }

    const deviceCount = await Device.countDocuments({ userId: req.user.id });
    if (deviceCount >= 3) {
      return res.status(403).json({ message: "Device limit reached (3 max)" });
    }

    const device = await Device.create({ name, type, userId: req.user.id });

    pairingCode.status = "claimed";
    pairingCode.deviceId = device._id;
    await pairingCode.save();

    res.status(201).json(device);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
