import express from "express";
import { getManifestForDevice } from "../controllers/manifestController.js";

const router = express.Router();

router.get("/:deviceId", getManifestForDevice);

export default router;
