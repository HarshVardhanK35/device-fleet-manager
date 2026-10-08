import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    playlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
      required: true,
    },
    beginDT: {
      type: Date,
    },
    endDT: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 86400 },
    },
  },
  { timestamps: true },
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
