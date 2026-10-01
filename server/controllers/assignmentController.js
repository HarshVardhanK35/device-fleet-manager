import Assignment from "../models/Assignment.js";
import Device from "../models/Device.js";

export const createAssignment = async (req, res) => {
  try {
    const device = await Device.findById(req.body.deviceId);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const isOwner = device.userId && req.user.id === device.userId.toString();
    const isAllowedAdmin =
      req.user.role === "admin" && device.adminControl === true;

    if (!isOwner && !isAllowedAdmin) {
      return res.status(403).json({
        message: "You don't have permission to publish to this device",
      });
    }

    const assignment = await Assignment.create(req.body);
    res.status(201).json(assignment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("deviceId")
      .populate({ path: "playlistId", populate: { path: "contentItems" } });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("deviceId")
      .populate({ path: "playlistId", populate: { path: "contentItems" } });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAssignments = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json({ message: "Assignment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
