import express from "express";
import { fetchFeed } from "../controllers/feedController.js";

const router = express.Router();

router.get("/fetch-feed", fetchFeed);

export default router;
