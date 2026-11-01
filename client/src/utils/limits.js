// Account limits. These mirror what the backend enforces (contentController.js
// for images and video, deviceController.js / pairingController.js for
// screens) — they're a UX mirror for the client, never the real check, and must
// stay in sync with the server.
export const MAX_IMAGES = 30;
export const MAX_VIDEO_BYTES = 150 * 1024 * 1024; // 150MB
export const MAX_SCREENS = 3;

export function formatMB(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// Used by: pages/Content.jsx, pages/PlayerSlots.jsx, components/LimitsPanel.jsx.
