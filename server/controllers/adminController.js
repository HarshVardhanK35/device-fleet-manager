import mongoose from "mongoose";

import User from "../models/User.js";
import Device from "../models/Device.js";

const PAGE_SIZE_MAX = 50;

// Escapes regex characters so a search like "a+b" is matched literally.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /admin/users?page=1&limit=20&search=
// One page of users with how many screens each has — names and counts only,
// never passwords, tokens, content or playlists.
export const listUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      PAGE_SIZE_MAX,
    );
    const search = (req.query.search || "").trim();

    const filter = {};
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { firstName: pattern },
        { lastName: pattern },
        { email: pattern },
        { username: pattern },
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("firstName lastName username email role emailVerified createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    // One query for every screen count on this page, instead of one per user.
    const counts = await Device.aggregate([
      { $match: { userId: { $in: users.map((u) => u._id) } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);
    const countByUser = new Map(counts.map((c) => [String(c._id), c.count]));

    res.status(200).json({
      users: users.map((u) => ({
        ...u,
        screenCount: countByUser.get(String(u._id)) || 0,
      })),
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /admin/users/:id/screens
// A user's screens: name and status only (the admin never sees what plays).
export const listUserScreens = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const screens = await Device.find({ userId: req.params.id })
      .select("name status lastSeenAt")
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json(screens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
