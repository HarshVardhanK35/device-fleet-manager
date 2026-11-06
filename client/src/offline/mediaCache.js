// The browser storage a screen keeps its files in while offline (Cache API).
// One cache, "cw-media-v1", keyed by the exact URL a player asks for; the
// service worker (public/player-sw.js) reads the same cache, so a saved file
// is served from here instead of the network.

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
export async function hasRoom(bytes) {
  try {
    const { quota, usage } = await navigator.storage.estimate();
    if (!quota) return true;
    return quota - usage > bytes * 1.2 + 50 * 1024 * 1024;
  } catch {
    return true;
  }
}

// Ask the browser not to delete our saved files when the device runs low on space.
export async function keepStorage() {
  try {
    await navigator.storage?.persist?.();
  } catch {
    // not supported: the files may be cleared under pressure, and are saved again
  }
}

// Used by: offline/downloadManager.js, offline/registerOffline.js, offline/forgetScreen.js,
// apps/shared/playback/loadAppBundle.js, components/screens/DevicePlayback.jsx.
