import express from "express";
import { protect } from "../middleware/auth.js";
import { fetchAppBundle } from "../controllers/appBundleController.js";

const router = express.Router();

router.get("/fetch-bundle", protect, fetchAppBundle);

export default router;
