import JSZip from "jszip";

import { fetchAppBundle as fetchAppBundleBytes } from "../../api/apps.js";

// Fetches and unzips a built app bundle (e.g. Weather's staging/prod
// weather.zip from resolveAppUrl.js), returning the extracted index.html
// as a string. Apps build via vite-plugin-singlefile — everything (JS/CSS)
// is already inlined into that one file, so there's never a separate
// assets/ folder or relative paths to resolve after unzipping; pulling out
// index.html's text is the whole job.
//
// The actual fetch goes through DFM's own backend (api/apps.js), not
// straight to GitHub — GitHub Release assets don't send CORS headers, so a
// browser can't fetch them cross-origin directly. The backend proxies it
// server-to-server instead, where CORS doesn't apply.
//
// Not used for a dev URL (e.g. localhost:5174, Vite's own dev server) —
// that's a live page already, loaded directly via iframe `src`, not a zip.
//
// Caches the extracted HTML in memory per URL, so re-opening a settings
// screen or switching preview sizes doesn't re-fetch/re-unzip the same
// bundle every time. In-memory only (not localStorage) — a build is
// replaced wholesale on every push to staging/prod, so a stale cached
// bundle surviving a page reload would be wrong, not just wasteful.
const bundleCache = new Map();

export async function loadAppBundle(zipUrl) {
  const cached = bundleCache.get(zipUrl);
  if (cached) return cached;

  const bytes = await fetchAppBundleBytes(zipUrl);
  const zip = await JSZip.loadAsync(bytes);
  const indexFile = zip.file("index.html");
  if (!indexFile) {
    throw new Error("App bundle zip has no index.html");
  }

  const html = await indexFile.async("string");
  bundleCache.set(zipUrl, html);
  return html;
}

// Returns true for anything this function should actually unzip (a built
// bundle), false for a dev server URL or a non-URL placeholder like
// "about:blank" — those get loaded directly via iframe `src` instead.
export function isAppBundleUrl(url) {
  return typeof url === "string" && url.endsWith(".zip");
}
