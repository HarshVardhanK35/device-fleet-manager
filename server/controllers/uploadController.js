import cloudinary from "../config/cloudinary.js";

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    // 2. creates stream to send that file in memory
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export const uploadMedia = async (req, res) => {
  try {
    // 1. req.file.buffer - contains uploaded file in memory (cause of multer.memoryStorage())
    // 3. sends the actual file buffer to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);
    // console.log(result);

    const thumbnailUrl =
      result.resource_type === "video"
        ? result.secure_url.replace(/\.[^/.]+$/, ".jpg")
        : result.secure_url;

    // 4. success - result.secure_url is the Cloudinary URL - returned to the frontend
    res.status(200).json({ url: result.secure_url, thumbnailUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
