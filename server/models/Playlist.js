import mongoose from "mongoose";
import { LIMITS, maxLengthWhenChanged } from "../utils/fieldLimits.js";

const playlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      validate: maxLengthWhenChanged("name", LIMITS.playlistName, "Name"),
    },
    description: {
      type: String,
      default: "",
      validate: maxLengthWhenChanged("description", LIMITS.playlistDescription, "Description"),
    },
    contentItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
      },
    ],
    // Positions (0, 1, 2 ...) in contentItems that stay in the playlist but are not
    // played. By position, not by content id, so one copy of an image can be skipped
    // while another copy still plays.
    skippedSlots: [Number],
  },
  { timestamps: true },
);

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
