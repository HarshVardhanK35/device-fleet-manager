import mongoose from "mongoose";

// defines shape to our document
const contentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "app"],
    },
    folder: {
      type: String,
      default: "",
    },
    configBlob: {
      // special type: "anything goes" - no fixed structure, no validation on shape.
      // It can hold any JSON-like value: an object, array, string, number, whatever.
      type: mongoose.Schema.Types.Mixed,
    },
    durationInMillis: {
      type: Number,
    },
    tags: {
      type: [String],
    },
    mediaUrl: {
      type: String, // image and video types
    },
    thumbnailUrl: {
      type: String,
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Content: model name - used to create, and find etc.,
// ike Content.create() and Content.find() - inside contentRoutes
const Content = mongoose.model("Content", contentSchema);

export default Content;
