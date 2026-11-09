import { logError, logEvent, logForeign, logWarn } from "../utils/screenLog/screenLog.js";
import { SHELL_CACHE } from "./mediaCache.js";

// Turns on offline support for the player pages: registers the service worker
// (public/player-sw.js) and saves the page the player is running, so a reload
// with no internet still opens it. Safe to call more than once; does nothing
// where service workers are not supported (some old TV browsers).
let started = false;

export function registerOffline() {
  if (started) return;
  if (!("serviceWorker" in navigator)) {
    logWarn("sw", "This browser has no service worker: saved files can NOT be served offline, and the page itself will not open without internet");
    return;
  }
  started = true;
  // Lines the service worker writes about what it served (it cannot log into this page directly).
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "CW_LOG") logForeign("sw", event.data.level || "info", event.data.message);
  });
  navigator.serviceWorker
    .register("/player-sw.js", { scope: "/" })
    .then((registration) => {
      logEvent("sw", `Service worker registered (scope ${registration.scope})`);
      return navigator.serviceWorker.ready;
    })
    .then(() => {
      logEvent("sw", `Service worker is ready; it ${navigator.serviceWorker.controller ? "controls this page" : "does NOT control this page yet (a reload is needed before it serves offline files)"}`);
      return saveShell();
    })
    .catch((error) => logError("sw", `Service worker could not start: ${error.name}: ${error.message}`));
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
  let added = 0;
  for (const url of current) {
    if (!(await cache.match(url))) {
      await cache.add(url).then(() => (added += 1)).catch((error) => logWarn("sw", `Could not save the page file ${url.slice(-60)}: ${error.message}`));
    }
  }
  logEvent("sw", `The player page files are saved for offline start: ${current.size} file(s), ${added} newly saved`);

  try {
    const page = await fetch("/index.html", { cache: "no-store" });
    if (page.ok) await cache.put("/__shell", page);
  } catch {
    // offline right now: the page saved earlier stays
    logWarn("sw", "Could not refresh the saved player page (offline?); the one saved earlier stays");
  }
}

// Used by: components/screens/DevicePlayback.jsx, pages/Screens.jsx.
