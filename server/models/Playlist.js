import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    contentItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Content" }],
  },
  { timestamps: true },
);

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
