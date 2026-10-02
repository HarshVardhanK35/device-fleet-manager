import express from "express";

import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { uploadMedia } from "../controllers/uploadController.js";

const router = express.Router();

/**
 * POST req to "/" - protect: checks user authentication 
 * upload.single("file") - Multer receives one uploaded file from the form field named "file" and puts file in req.file.
 * uploadMedia - takes req.file.buffer and uploads it to Cloudinary.
 * 
*/
router.post("/", protect, upload.single("file"), uploadMedia);

export default router;
