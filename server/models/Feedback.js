import mongoose from "mongoose";
import { LIMITS, maxLengthWhenChanged } from "../utils/fieldLimits.js";

export const FEEDBACK_TYPES = ["issue", "suggestion", "other"];
// The admin decides once: "noted" (we will work on it) or "not-planned".
export const FEEDBACK_STATUSES = ["sent", "seen", "noted", "not-planned"];

// One message from a signed-in user to the admin. The admin answers it once, with
// one status and one `reply`; `userUnread` lights the user's red
// dot until they open their Feedback page.
const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: FEEDBACK_TYPES,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      validate: maxLengthWhenChanged("message", LIMITS.feedbackMessage, "Message"),
    },
    status: {
      type: String,
      enum: FEEDBACK_STATUSES,
      default: "sent",
    },
    reply: {
      type: String,
      default: "",
      trim: true,
      validate: maxLengthWhenChanged("reply", LIMITS.feedbackReply, "Reply"),
    },
    userUnread: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// The admin inbox filters by status and lists newest first.
feedbackSchema.index({ status: 1, createdAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
