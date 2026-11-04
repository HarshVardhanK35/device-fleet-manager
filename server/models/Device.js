import mongoose from "mongoose";
import crypto from "crypto";
import { LIMITS, maxLengthWhenChanged } from "../utils/fieldLimits.js";

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate: maxLengthWhenChanged("name", LIMITS.screenName, "Name"),
    },
    type: {
      type: String,
      trim: true,
      validate: maxLengthWhenChanged("type", LIMITS.screenType, "Type"),
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    accessToken: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(32).toString("hex"),
      select: false,
    },
  },
  { timestamps: true },
);

const Device = mongoose.model("Device", deviceSchema);

export default Device;
