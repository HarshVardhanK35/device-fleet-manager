import mongoose from "mongoose";

const pairingCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "claimed"],
      default: "pending",
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
    },
  },
  { timestamps: true },
);

pairingCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PairingCode", pairingCodeSchema);
