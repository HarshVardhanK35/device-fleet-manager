import express from "express";
import { fetchAppBundle } from "../controllers/appBundleController.js";

const router = express.Router();

router.get("/fetch-bundle", fetchAppBundle);

export default router;
