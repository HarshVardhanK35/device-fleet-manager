// CastWise player service worker (registered by src/offline/registerOffline.js
// on the /screens and /player/:token pages).
//
// It lets a screen keep working with no internet:
//   - the player page itself (index.html + its /assets files) opens offline
//   - images, videos and app images that the page saved (cache "cw-media-v1")
//     are served from that saved copy instead of the network, with Range
//     support so a saved video can play and seek
//   - the Google Fonts an app uses are kept after their first online load
// The page (src/offline/*) decides WHAT to save; this file only serves it.

const SHELL = "cw-shell-v1"; // the player page and its /assets files
const MEDIA = "cw-media-v1"; // files saved by src/offline/downloadManager.js
const FONTS = "cw-fonts-v1"; // Google Fonts used by the apps
const KEEP = [SHELL, MEDIA, FONTS];
const PAGE_WAIT_MS = 4000; // a page request that hangs this long falls back to the saved page

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (name.startsWith("cw-") && !KEEP.includes(name)) await caches.delete(name);
      }
      await self.clients.claim();
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
  } else if (["image", "video", "audio"].includes(req.destination)) {
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
  } catch {
    const saved = await cache.match("/__shell");
    return saved || Response.error();
  }
}

// Built files have a hash in their name, so a saved one never goes stale.
async function assetHandler(req) {
  const cache = await caches.open(SHELL);
  const saved = await cache.match(req);
  if (saved) return saved;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

// Saved copy first (as the player decided), the network for anything not saved.
async function mediaHandler(req) {
  const cache = await caches.open(MEDIA);
  const saved = await cache.match(req.url);
  if (!saved) return fetch(req);
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
