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
    // True from "Take over" until "Release" (or until the physical screen connects
    // again), so the Player page can show "Release screen" after the owner has
    // left the page and come back.
    takenOver: {
      type: Boolean,
      default: false,
    },
    // When the owner last sent this screen a "Refresh screen" (one per minute).
    lastRefreshAt: {
      type: Date,
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
