import { SHELL_CACHE } from "./mediaCache.js";

// Turns on offline support for the player pages: registers the service worker
// (public/player-sw.js) and saves the page the player is running, so a reload
// with no internet still opens it. Safe to call more than once; does nothing
// where service workers are not supported (some old TV browsers).
let started = false;

export function registerOffline() {
  if (started || !("serviceWorker" in navigator)) return;
  started = true;
  navigator.serviceWorker
    .register("/player-sw.js", { scope: "/" })
    .then(() => navigator.serviceWorker.ready)
    .then(saveShell)
    .catch(() => {});
}

// Keeps exactly the built files this page uses (and the page itself) in the
// saved copy; files from an older deploy are dropped, so it never grows.
async function saveShell() {
  const cache = await caches.open(SHELL_CACHE);
  const current = new Set(
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((url) => url.startsWith(window.location.origin) && new URL(url).pathname.startsWith("/assets/")),
  );

  for (const request of await cache.keys()) {
    if (new URL(request.url).pathname.startsWith("/assets/") && !current.has(request.url)) {
      await cache.delete(request);
    }
  }
  for (const url of current) {
    if (!(await cache.match(url))) await cache.add(url).catch(() => {});
  }

  try {
    const page = await fetch("/index.html", { cache: "no-store" });
    if (page.ok) await cache.put("/__shell", page);
  } catch {
    // offline right now: the page saved earlier stays
  }
}

// Used by: components/screens/DevicePlayback.jsx, pages/Screens.jsx.
