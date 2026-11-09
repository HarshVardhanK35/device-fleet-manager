import { loadAppBundle, isAppBundleUrl } from "../apps/shared/playback/loadAppBundle.js";
import { resolveAppUrlByName } from "../apps/resolveAppUrl.js";
import { getOptimizedThumbnail } from "../utils/content/cloudinaryTransform.js";
import { appBundleKey } from "./mediaCache.js";

// A screen-sized copy of an image (not the multi-MB original). This is the
// exact URL the player shows, so it is also what gets saved.
const SCREEN_IMAGE_WIDTH = 1920;
export const screenImageUrl = (url) => getOptimizedThumbnail(url, SCREEN_IMAGE_WIDTH);

// The size Announcements' Event Cards ask Cloudinary for (see the widget's
// sizedImage): saved too, so a card's photo shows offline.
const APP_IMAGE_WIDTH = 900;
const appImageUrl = (url) => getOptimizedThumbnail(url, APP_IMAGE_WIDTH);

// A browser without H.264 / AAC (a plain Chromium build, some set-top browsers) cannot
// play an MP4 at all. For those, a Cloudinary video is asked for as WebM instead (it
// converts on the fly), and that same URL is what gets saved for offline play.
const CAN_PLAY_MP4 = (() => {
  try {
    return !!document.createElement("video").canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
  } catch {
    return true;
  }
})();
const CLOUDINARY_VIDEO = /(res\.cloudinary\.com\/.+\/video\/upload\/.+)\.(mp4|mov|m4v)(\?.*)?$/i;

export const toWebm = (url) => url.replace(CLOUDINARY_VIDEO, "$1.webm$3");

// The address a video is played from and saved under on this device.
export const videoUrl = (url) => (CAN_PLAY_MP4 ? url : toWebm(url));

const norm = (url) => {
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
};

const IMAGE_LINK = /^https?:\/\/\S+$/;
const IMAGE_LOOKS = /\/image\/upload\/|\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i;

// Every image link inside an app's saved settings (a card photo, a logo).
function imageUrlsIn(value, found = new Set()) {
  if (typeof value === "string") {
    if (IMAGE_LINK.test(value) && IMAGE_LOOKS.test(value)) found.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => imageUrlsIn(v, found));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => imageUrlsIn(v, found));
  }
  return found;
}

// What the saved copy of one playlist item is stored under, or null when
// there is nothing to save for it (an app running from a dev server).
export function itemKey(item) {
  if (item.type === "image" && item.mediaUrl) return norm(screenImageUrl(item.mediaUrl));
  if (item.type === "video" && item.mediaUrl) return norm(videoUrl(item.mediaUrl));
  if (item.type === "app") {
    const src = resolveAppUrlByName(item.configBlob?.appType);
    return isAppBundleUrl(src) ? appBundleKey(src) : null;
  }
  return null;
}

// The files to save for a playlist's content, as downloadManager items.
export function downloadItems(content = []) {
  const items = new Map();
  const add = (item) => {
    if (!items.has(item.key)) items.set(item.key, item);
  };

  for (const c of content) {
    if (c.type === "image" && c.mediaUrl) {
      const url = norm(screenImageUrl(c.mediaUrl));
      add({ key: url, url, size: c.sizeBytes || 0 });
    } else if (c.type === "video" && c.mediaUrl) {
      const url = norm(videoUrl(c.mediaUrl));
      add({ key: url, url, size: c.sizeBytes || 0 });
    } else if (c.type === "app") {
      const src = resolveAppUrlByName(c.configBlob?.appType);
      if (isAppBundleUrl(src)) {
        add({ key: appBundleKey(src), size: 0, run: () => loadAppBundle(src, { remember: true }) });
      }
      for (const found of imageUrlsIn(c.configBlob)) {
        const raw = norm(found);
        add({ key: raw, url: raw, size: 0 });
        const sized = norm(appImageUrl(found));
        if (sized !== raw) add({ key: sized, url: sized, size: 0 });
      }
    }
  }
  return [...items.values()];
}

// Used by: components/screens/DevicePlayback.jsx.
