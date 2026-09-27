import buildManifestForDevice from "../services/manifestService.js";
import { publishManifestToDevice } from "../services/mqttService.js";

export const getManifestForDevice = async (req, res) => {
  try {
    const manifest = await buildManifestForDevice(req.params.deviceId);
    publishManifestToDevice(req.params.deviceId, manifest)
    res.status(200).json(manifest);
  } catch (err) {
    if (err.message === "Device not found!") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};
