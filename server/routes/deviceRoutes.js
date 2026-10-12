import express from "express";
import {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
  connectDevice,
  takeOverDevice,
  releaseDevice,
  deviceExists,
  unpairDevice,
  disconnectDevice,
} from "../controllers/deviceController.js";

import { protect } from "../middleware/auth.js";

// express.Router() creates a mini, self-contained instance of Express's routing system
const router = express.Router();

// express.Router():
// lets us define routes in a separate file instead of piling all into index.js
// then plug it into app later with app.use().
router.post("/", protect, createDevice);

// logged in user access getAllDevices | "protect" checks - user is logged in or not!
router.get("/", protect, getAllDevices);

router.get("/:id", protect, getDeviceById);
router.post("/:token/connect", connectDevice);
router.post("/:token/disconnect", disconnectDevice);
router.get("/:token/exists", deviceExists);
router.delete("/:token/unpair", unpairDevice);
router.post("/:id/take-over", protect, takeOverDevice);
router.post("/:id/release", protect, releaseDevice);
router.put("/:id", protect, updateDevice);
router.delete("/:id", protect, deleteDevice);

export default router;
