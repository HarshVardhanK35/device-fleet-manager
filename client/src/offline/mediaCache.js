// The browser storage a screen keeps its files in while offline (Cache API).
// One cache, "cw-media-v1", keyed by the exact URL a player asks for; the
// service worker (public/player-sw.js) reads the same cache, so a saved file
// is served from here instead of the network.

import { logEvent, logWarn } from "../utils/screenLog/screenLog.js";

const MEDIA_CACHE = "cw-media-v1";
export const SHELL_CACHE = "cw-shell-v1";

const supported = typeof caches !== "undefined";

// Apps are saved as one HTML string; this is the made-up URL it lives under.
export const appBundleKey = (zipUrl) => `${window.location.origin}/__cw/app-bundle?u=${encodeURIComponent(zipUrl)}`;

async function open() {
  return caches.open(MEDIA_CACHE);
}

export async function isSaved(key) {
  if (!supported) return false;
  try {
    return !!(await (await open()).match(key));
  } catch {
    return false;
  }
}

// The saved file itself (a Blob), or null. Used to play a saved video from memory: a TV browser's
// video player asks for the file by itself and never goes through the service worker.
export async function readSavedBlob(key) {
  if (!supported) return null;
  try {
    const hit = await (await open()).match(key);
    return hit ? await hit.blob() : null;
  } catch {
    return null;
  }
}

export async function saveBlob(key, blob, contentType) {
  const cache = await open();
  await cache.put(
    key,
    new Response(blob, { status: 200, headers: { "Content-Type": contentType || blob.type || "application/octet-stream" } }),
  );
}

export async function saveText(key, text, contentType = "text/plain") {
  if (!supported) return;
  await saveBlob(key, new Blob([text], { type: contentType }), contentType);
}

export async function readText(key) {
  if (!supported) return null;
  const hit = await (await open()).match(key);
  return hit ? hit.text() : null;
}

// Cleanup: delete every saved file that is not in `keep` (a Set of keys).
export async function deleteExcept(keep) {
  if (!supported) return;
  try {
    const cache = await open();
    for (const request of await cache.keys()) {
      if (!keep.has(request.url)) await cache.delete(request);
    }
  } catch {
    // storage unavailable: nothing to clean
  }
}

// Delete every saved file (a screen that was unpaired).
export async function clearMedia() {
  if (!supported) return;
  try {
    await caches.delete(MEDIA_CACHE);
  } catch {
    // storage unavailable: nothing to clear
  }
}

// Is there room for `bytes` more? Leaves a 50 MB margin so the device never runs dry.
// `label` is only for the log (which file asked). The margin kept free is 10% of the quota,
// at most 50 MB (a fixed 50 MB left a TV with an 80 MB quota room for only a 24 MB file).
export async function hasRoom(bytes, label = "a file") {
  const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
  try {
    const { quota, usage } = await navigator.storage.estimate();
    if (!quota) {
      logEvent("offline", `Storage check for ${label}: the browser reports no quota, so it is allowed`);
      return true;
    }
    const margin = Math.min(50 * 1024 * 1024, quota * 0.1);
    const needed = bytes * 1.1 + margin;
    const free = quota - usage;
    const ok = free > needed;
    if (!ok) {
      logWarn(
        "offline",
        `Not enough space for ${label}: the file is ${mb(bytes)}, so ${mb(needed)} must be free (file x1.1 + a ${mb(margin)} margin, 10% of the quota), but only ${mb(free)} is free (quota ${mb(quota)}, used ${mb(usage)})`,
      );
    }
    return ok;
  } catch (error) {
    logEvent("offline", `Storage check for ${label} failed (${error.message}), so it is allowed`);
    return true;
  }
}

// Ask the browser not to delete our saved files when the device runs low on space.
// Never wait for the answer: a TV browser (a Samsung one) never answers persist(), and the
// downloads used to wait for it, so none of them ever started.
export function keepStorage() {
  const asked = Promise.resolve().then(() => navigator.storage?.persist?.());
  const gaveUp = new Promise((resolve) => setTimeout(() => resolve("no answer"), 3000));
  return Promise.race([asked, gaveUp])
    .then((persisted) => {
      logEvent("offline", `Asked the browser to keep the saved files: ${persisted === undefined ? "not supported" : persisted === "no answer" ? "no answer in 3 s (downloads did not wait)" : persisted ? "granted" : "not granted (files may be cleared when the device runs low on space)"}`);
    })
    .catch(() => {
      // not supported: the files may be cleared under pressure, and are saved again
    });
}

// Used by: offline/downloadManager.js, offline/registerOffline.js, offline/forgetScreen.js,
// apps/shared/playback/loadAppBundle.js, components/screens/DevicePlayback.jsx.
