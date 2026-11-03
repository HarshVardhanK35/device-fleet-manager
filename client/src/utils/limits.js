// Account limits. These mirror what the backend enforces (contentController.js
// for images and video, deviceController.js / pairingController.js for
// screens) — they're a UX mirror for the client, never the real check, and must
// stay in sync with the server.
export const MAX_IMAGES = 30;
export const MAX_VIDEO_BYTES = 150 * 1024 * 1024; // 150MB
export const MAX_SCREENS = 3;

// Cloudinary free plan, per file (checked before the upload starts).
export const MAX_IMAGE_FILE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_FILE_BYTES = 100 * 1024 * 1024; // 100MB
export const MAX_IMAGE_MEGAPIXELS = 25;

// Text limits (server/utils/fieldLimits.js enforces the same numbers).
export const MAX_CONTENT_NAME = 60;
export const MAX_APP_NAME = 55; // an app tile's name (guarantees two lines in the mobile editor header)
export const MAX_PLAYLIST_NAME = 60;
export const MAX_PLAYLIST_DESCRIPTION = 200;
export const MAX_SCREEN_NAME = 30;
export const MAX_FIRST_NAME = 20;
export const MAX_LAST_NAME = 20;

export function formatMB(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// Used by: pages/Content.jsx, pages/PlayerSlots.jsx, components/LimitsPanel.jsx.
