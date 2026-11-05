import express from "express";

import {
  createFeedback,
  listMyFeedback,
  markMyFeedbackRead,
  deleteMyFeedback,
  getFeedbackIndicator,
} from "../controllers/feedbackController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Every feedback route needs a signed-in user.
router.use(protect);

router.post("/", createFeedback);
router.get("/mine", listMyFeedback);
router.post("/mine/read", markMyFeedbackRead);
router.get("/indicator", getFeedbackIndicator);
router.delete("/:id", deleteMyFeedback);

export default router;
