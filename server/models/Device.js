import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      required: true,
      enum: ["android", "console", "arch"],
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Device = mongoose.model("Device", deviceSchema);

export default Device;
