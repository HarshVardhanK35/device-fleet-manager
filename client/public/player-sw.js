// CastWise player service worker (registered by src/offline/registerOffline.js
// on the /screens and /player/:token pages).
//
// It lets a screen keep working with no internet:
//   - the player page itself (index.html + its /assets files) opens offline
//   - images and app images that the page saved (cache "cw-media-v1") are
//     served from that saved copy instead of the network; videos and audio use
//     the network while it works and the saved copy (with Range support, so it
//     can play and seek) only when it does not
//   - the Google Fonts an app uses are kept after their first online load
// The page (src/offline/*) decides WHAT to save; this file only serves it.

const SHELL = "cw-shell-v1"; // the player page and its /assets files
const MEDIA = "cw-media-v1"; // files saved by src/offline/downloadManager.js
const FONTS = "cw-fonts-v1"; // Google Fonts used by the apps
const KEEP = [SHELL, MEDIA, FONTS];
const PAGE_WAIT_MS = 4000; // a page request that hangs this long falls back to the saved page

// The service worker cannot write into the page's log, so it sends short lines to the open
// pages (src/offline/registerOffline.js records them as [sw] lines).
function note(level, message) {
  self.clients
    .matchAll({ includeUncontrolled: true })
    .then((clients) => clients.forEach((client) => client.postMessage({ type: "CW_LOG", level, message })))
    .catch(() => {});
}
const short = (url) => (url.length > 100 ? `…${url.slice(-97)}` : url);
const seen = new Set(); // saved copies already reported once

self.addEventListener("install", () => {
  note("info", "Service worker installing");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (name.startsWith("cw-") && !KEEP.includes(name)) await caches.delete(name);
      }
      await self.clients.claim();
      note("info", "Service worker active and controlling this page");
    })(),
  );
});

const isPlayerPage = (url) =>
  url.origin === self.location.origin && (url.pathname === "/screens" || url.pathname.startsWith("/player/"));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (req.mode === "navigate" && isPlayerPage(url)) {
    event.respondWith(pageHandler(req));
  } else if (url.origin === self.location.origin && url.pathname.startsWith("/assets/")) {
    event.respondWith(assetHandler(req));
  } else if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(fontHandler(req));
  } else if (req.destination === "video" || req.destination === "audio") {
    event.respondWith(streamHandler(req));
  } else if (req.destination === "image") {
    event.respondWith(mediaHandler(req));
  }
});

// The player page: from the network when it answers, otherwise the saved copy.
async function pageHandler(req) {
  const cache = await caches.open(SHELL);
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, reject) => setTimeout(() => reject(new Error("slow")), PAGE_WAIT_MS)),
    ]);
    if (res.ok) cache.put("/__shell", res.clone());
    return res;
  } catch (error) {
    const saved = await cache.match("/__shell");
    note(saved ? "warn" : "error", `The player page could not be fetched (${error.message}); ${saved ? "opened from the saved copy" : "NO saved copy, the page will not open"}`);
    return saved || Response.error();
  }
}

// Built files have a hash in their name, so a saved one never goes stale.
async function assetHandler(req) {
  const cache = await caches.open(SHELL);
  const saved = await cache.match(req);
  if (saved) return saved;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (error) {
    note("error", `A page file could not be fetched and is not saved: ${short(req.url)} (${error.message})`);
    throw error;
  }
}

// A video or audio file: the network first, the saved copy only when the network fails
// (offline). A <video> that began playing from the network must not be handed to the
// saved copy half way through (the download finishing while it plays): the browser
// cannot switch sources in the middle of a stream and freezes with a read error.
async function streamHandler(req) {
  try {
    return await fetch(req);
  } catch (error) {
    const cache = await caches.open(MEDIA);
    const saved = await cache.match(req.url);
    if (!saved) {
      note("error", `Video/audio could not be fetched (${error.message}) and there is NO saved copy: ${short(req.url)}. It will stop.`);
      return Response.error();
    }
    note("warn", `Video/audio fetch failed (${error.message}); playing the saved copy instead: ${short(req.url)}`);
    const range = req.headers.get("range");
    return range ? rangeResponse(range, saved) : saved;
  }
}

// Saved copy first (as the player decided), the network for anything not saved.
async function mediaHandler(req) {
  const cache = await caches.open(MEDIA);
  const saved = await cache.match(req.url);
  if (!saved) {
    try {
      return await fetch(req);
    } catch (error) {
      note("error", `Image could not be fetched (${error.message}) and is NOT saved: ${short(req.url)}`);
      throw error;
    }
  }
  if (!seen.has(req.url)) {
    seen.add(req.url);
    note("info", `Image served from the saved copy: ${short(req.url)}`);
  }
  const range = req.headers.get("range");
  return range ? rangeResponse(range, saved) : saved;
}

// A <video> asks for byte ranges; answer them from the saved whole file.
async function rangeResponse(rangeHeader, saved) {
  const blob = await saved.blob();
  const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  if (!match) return saved;
  const size = blob.size;
  let start = match[1] === "" ? 0 : Number(match[1]);
  let end = match[2] === "" ? size - 1 : Number(match[2]);
  if (match[1] === "" && match[2] !== "") {
    start = Math.max(size - Number(match[2]), 0); // "last N bytes"
    end = size - 1;
  }
  end = Math.min(end, size - 1);
  if (start > end) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": saved.headers.get("Content-Type") || blob.type || "video/mp4",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}

// Fonts: the saved copy at once, refreshed from the network when it answers.
async function fontHandler(req) {
  const cache = await caches.open(FONTS);
  const saved = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok || res.type === "opaque") cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return saved || (await network) || Response.error();
}
