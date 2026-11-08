// DTO - data transfer object
import Device from "../models/Device.js";
import Assignment from "../models/Assignment.js";

async function buildManifestForDevice(deviceId) {
  const device = await Device.findById(deviceId);

  if (!device) {
    throw new Error("Device not found!");
  }

  const assignments = await Assignment.find({ deviceId }).populate({
    path: "playlistId",
    populate: { path: "contentItems" },
  });

  return {
    deviceId: device._id,
    deviceName: device.name,
    generatedAt: new Date(),
    playlists: assignments.map((assignment) => {
      // Skipped items stay in the playlist but are not sent to the screen.
      const skipped = new Set(assignment.playlistId.skippedItems.map(String));
      return {
        assignmentId: assignment._id,
        beginDT: assignment.beginDT,
        endDT: assignment.endDT,
        playlistName: assignment.playlistId.name,
        content: assignment.playlistId.contentItems.filter(
          (item) => !skipped.has(String(item._id)),
        ),
      };
    }),
  };
}

export default buildManifestForDevice;
