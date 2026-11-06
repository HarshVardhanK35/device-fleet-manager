import { clearMedia } from "./mediaCache.js";
import { forgetSavedManifest } from "./savedManifest.js";

// A screen that is unpaired (or was removed from the account) must not keep
// the last screen's files and manifest: delete both.
export async function forgetScreen(token) {
  forgetSavedManifest(token);
  await clearMedia();
}

// Used by: pages/Screens.jsx.
