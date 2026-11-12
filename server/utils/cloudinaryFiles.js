import cloudinary from "../config/cloudinary.js";
import Content from "../models/Content.js";

// What Cloudinary calls a file (its public id and kind) can be read from the address we stored when
// it was uploaded:  https://res.cloudinary.com/<cloud>/<image|video>/upload/[transformations/][v123/]<public id>.<ext>
// Returns { publicId, resourceType }, or null for an address that is not a Cloudinary upload.
function parseCloudinaryUrl(url) {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com/")) return null;
  const match = url.split("?")[0].match(/\/(image|video)\/upload\/(.+)$/);
  if (!match) return null;

  const segments = match[2].split("/");
  const version = segments.findIndex((s) => /^v\d+$/.test(s));
  const idSegments = version >= 0 ? segments.slice(version + 1) : segments;
  const publicId = decodeURIComponent(idSegments.join("/")).replace(/\.[a-z0-9]+$/i, "");
  return publicId ? { publicId, resourceType: match[1] } : null;
}

// An app (an announcement with a photo, a news app with a logo) keeps the address of the library
// picture it uses inside its settings. Deleting that picture's file would break the app, so the file
// is kept while one of the same user's apps still names it.
async function usedByAnApp(content) {
  const apps = await Content.find({ userId: content.userId, type: "app" }, { configBlob: 1 });
  return apps.some((app) => JSON.stringify(app.configBlob || {}).includes(content.mediaUrl));
}

// Deletes the Cloudinary file behind one content item, unless another content item or one of the user's
// apps still uses the same address. Never throws: a failed delete is logged, and the caller carries on
// (the database is the source of truth for what a user can see).
export async function deleteFileOfContent(content) {
  try {
    const file = parseCloudinaryUrl(content.mediaUrl);
    if (!file) return;
    const stillUsed = await Content.exists({ mediaUrl: content.mediaUrl, _id: { $ne: content._id } });
    if (stillUsed || (await usedByAnApp(content))) return;
    await cloudinary.uploader.destroy(file.publicId, {
      resource_type: file.resourceType,
      invalidate: true,
    });
  } catch (err) {
    console.error("Could not delete a Cloudinary file:", err.message);
  }
}

// Used by: controllers/contentController.js (deleteContent), controllers/authController.js (deleteUser).
