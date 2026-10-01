import express from "express";
import { getManifestForDevice } from "../controllers/manifestController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/:deviceId", protect, getManifestForDevice);

export default router;
