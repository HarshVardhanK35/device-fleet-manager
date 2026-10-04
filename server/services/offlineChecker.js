import Device from "../models/Device.js";

const THRESHOLD_MS = 20000;

export default function startOfflineChecker() {
  setInterval(async () => {
    const onlineDevices = await Device.find({ status: "online" });

    for (const device of onlineDevices) {
      if (Date.now() - device.lastSeenAt > THRESHOLD_MS) {
        await Device.findByIdAndUpdate(device._id, { status: "offline" });
      }
    }
  }, 15000);
}
