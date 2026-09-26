import express from "express";
import {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
} from "../controllers/deviceController.js";

// express.Router() creates a mini, self-contained instance of Express's routing system
const router = express.Router();

// express.Router():
// lets define routes in a separate file instead of piling all into index.js (main)
// then plug it into app later with app.use().
router.post("/", createDevice);
router.get("/", getAllDevices);
router.get("/:id", getDeviceById);
router.put("/:id", updateDevice);
router.delete("/:id", deleteDevice);

export default router;
