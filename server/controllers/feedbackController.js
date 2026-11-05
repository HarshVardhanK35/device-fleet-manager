import mongoose from "mongoose";

import Feedback, { FEEDBACK_STATUSES, FEEDBACK_TYPES } from "../models/Feedback.js";
import User from "../models/User.js";
import { validationMessage } from "../utils/fieldLimits.js";

const FEEDBACK_LIMIT = 5; // messages per account, in total (after that: email)
const PAGE_SIZE_MAX = 50;

function pageParams(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), PAGE_SIZE_MAX);
  return { page, limit };
}

// How many messages the account can still send.
const remainingFor = (user) => Math.max(FEEDBACK_LIMIT - (user?.feedbackCount || 0), 0);

// POST /feedback  { type, message }
// Uses one of the account's FEEDBACK_LIMIT messages in total; deleting a message
// later does not give it back (the count lives on the user, not on the messages).
export const createFeedback = async (req, res) => {
  try {
    const { type, message } = req.body;

    if (!FEEDBACK_TYPES.includes(type)) {
      return res.status(400).json({ message: "Choose a type" });
    }
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Write a message" });
    }

    // Take a slot first, in one atomic update, so two quick sends can't both
    // get through. Accounts that never sent anything have no count yet.
    const taken = await User.updateOne(
      {
        _id: req.user.id,
        $or: [
          { feedbackCount: { $exists: false } },
          { feedbackCount: { $lt: FEEDBACK_LIMIT } },
        ],
      },
      { $inc: { feedbackCount: 1 } },
    );
    if (taken.modifiedCount === 0) {
      return res.status(429).json({
        message: "You've used all your feedback messages. For anything else, email hello@castwise.site",
      });
    }

    try {
      const feedback = await Feedback.create({
        userId: req.user.id,
        type,
        message,
      });
      res.status(201).json(feedback);
    } catch (error) {
      // The message wasn't saved, so give the slot back.
      await User.updateOne({ _id: req.user.id }, { $inc: { feedbackCount: -1 } });
      res.status(400).json({ message: validationMessage(error) });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /feedback/mine?page=&limit=
// The user's own messages, newest first, plus how many they can still send
// (`remaining` of `limit`). `userUnread` per message is what drives the "Updated" tag; the page
// calls POST /feedback/mine/read after showing them.
export const listMyFeedback = async (req, res) => {
  try {
    const { page, limit } = pageParams(req.query);
    const filter = { userId: req.user.id };

    const [total, items, user] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.findById(req.user.id).select("feedbackCount").lean(),
    ]);

    res.status(200).json({
      items,
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
      remaining: remainingFor(user),
      limit: FEEDBACK_LIMIT,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /feedback/mine/read — the user opened their Feedback page: clear the dot.
export const markMyFeedbackRead = async (req, res) => {
  try {
    await Feedback.updateMany(
      { userId: req.user.id, userUnread: true },
      { $set: { userUnread: false } },
    );
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /feedback/:id — the owner, and only while it is still Sent.
export const deleteMyFeedback = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    if (feedback.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your feedback" });
    }
    if (feedback.status !== "sent") {
      return res
        .status(400)
        .json({ message: "You can only delete a message that hasn't been seen yet" });
    }

    await feedback.deleteOne();
    res.status(200).json({ message: "Feedback deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /feedback/indicator — what the red dots need, in one small request.
//   unread:    the user's messages the admin has changed since they last looked
//   adminOpen: (admins only) messages still Sent or Seen
export const getFeedbackIndicator = async (req, res) => {
  try {
    const unread = await Feedback.countDocuments({
      userId: req.user.id,
      userUnread: true,
    });
    const result = { unread };

    if (req.user.role === "admin") {
      result.adminOpen = await Feedback.countDocuments({
        status: { $in: ["sent", "seen"] },
      });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- admin ----------------

// GET /admin/feedback?status=&page=&limit=
// The inbox. `status` is one of the five statuses (the "New" filter is
// "sent"); omit it for All. `counts` feeds the filter chips.
export const adminListFeedback = async (req, res) => {
  try {
    const { page, limit } = pageParams(req.query);
    const { status } = req.query;

    const filter = {};
    if (status) {
      if (!FEEDBACK_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Unknown status" });
      }
      filter.status = status;
    }

    const [total, items, grouped] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "firstName lastName username email")
        .lean(),
      Feedback.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const counts = { all: 0 };
    for (const s of FEEDBACK_STATUSES) counts[s] = 0;
    for (const g of grouped) {
      counts[g._id] = g.count;
      counts.all += g.count;
    }

    res.status(200).json({
      items,
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
      counts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /admin/feedback/:id  { status?, reply? }
// Any status change or reply edit lights the user's dot. "Not planned" needs a
// reply (the reason shown to the user).
export const adminUpdateFeedback = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const { status, reply } = req.body;
    const nextStatus = status ?? feedback.status;
    if (!FEEDBACK_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ message: "Unknown status" });
    }
    const nextReply = reply === undefined ? feedback.reply : String(reply).trim();
    if (nextStatus === "not-planned" && !nextReply) {
      return res
        .status(400)
        .json({ message: "Add a reason when marking a message Not planned" });
    }

    if (nextStatus === feedback.status && nextReply === feedback.reply) {
      return res.status(200).json(feedback);
    }

    feedback.status = nextStatus;
    feedback.reply = nextReply;
    feedback.userUnread = true;
    await feedback.save();
    await feedback.populate("userId", "firstName lastName username email");

    res.status(200).json(feedback);
  } catch (error) {
    res.status(400).json({ message: validationMessage(error) });
  }
};

// DELETE /admin/feedback/:id — only once it is Done or Not planned.
export const adminDeleteFeedback = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    if (!["done", "not-planned"].includes(feedback.status)) {
      return res
        .status(400)
        .json({ message: "Only Done or Not planned messages can be deleted" });
    }

    await feedback.deleteOne();
    res.status(200).json({ message: "Feedback deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
