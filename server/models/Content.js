import mongoose from "mongoose";

// defines shape to our document
const contentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "app"],
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
  },
  { timestamps: true },
);

// Content: model name - used to create, and find etc.,
// ike Content.create() and Content.find() - inside contentRoutes
const Content = mongoose.model("Content", contentSchema);

export default Content;
