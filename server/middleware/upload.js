import multer from "multer";

// stores the uploaded file inside RAM temporarily
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    /**
     * MIME type - string like image/png or video/mp4
     * identifies a file's actual format/content-type
     * sent by the browser based on the file's content (not its name/extension)
     * so multer reads from upload - so we can check what kind of file it really is before accepting file 
     */
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image or video files are allowed"), false);
  }
};

// creates multer upload middleware
export const upload = multer({ storage, fileFilter });
