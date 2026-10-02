import multer from "multer";

// stores the uploaded file inside RAM temporarily
const storage = multer.memoryStorage();

// creates multer upload middleware
export const upload = multer({ storage });
