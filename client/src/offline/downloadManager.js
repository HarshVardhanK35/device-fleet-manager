import { logEvent, logWarn } from "../utils/screenLog/screenLog.js";
import { deleteExcept, hasRoom, isSaved, keepStorage, saveBlob } from "./mediaCache.js";

// Saves the files of the playing playlist so the screen can play them offline.
//   - smallest files first (an app and a small image before a big video)
//   - small files download in parallel (up to 3); a large one downloads alone
//   - a file is saved only when it arrived whole: a connection that drops
//     mid-download leaves nothing behind, and the file is tried again once
//     the screen is back online
//   - files that nothing uses any more are deleted
//   - a file that will not fit in the free space is skipped
//
// An item is { key, url?, size, run? }: `key` is what the saved copy is stored
// under, `size` (bytes, may be 0) only orders the queue, `run(signal)` is for
// anything that is not a plain file (an app bundle).

const SMALL_BYTES = 5 * 1024 * 1024; // above this a file is "large"
const MAX_PARALLEL = 3;
const RETRY_MS = 60000;
const MAX_TRIES = 5; // a file that keeps failing is given up on after this many tries

let session = 0;
let queue = [];
let failed = [];
let running = 0;
let largeRunning = 0;
let saved = new Set();
const tries = new Map(); // key -> failed tries so far
let retryTimer = null;
const controllers = new Set();
const listeners = new Set();
let wanted = 0; // files the playing playlist needs

const short = (key) => (key.length > 100 ? `…${key.slice(-97)}` : key);
const mb = (n) => (n ? `${(n / 1048576).toFixed(1)} MB` : "size unknown");

// For the log snapshot: where the downloads stand right now.
export const getDownloadState = () => ({
  wanted,
  saved: saved.size,
  waiting: queue.length,
  downloading: running,
  failedWaitingForRetry: failed.length,
  gaveUp: [...tries].filter(([, count]) => count >= MAX_TRIES).map(([key]) => short(key)),
});

function emit() {
  const copy = new Set(saved);
  listeners.forEach((fn) => fn(copy));
}

// The keys saved right now, and a way to hear when that changes.
export const getSaved = () => new Set(saved);

export function subscribeSaved(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function downloadFile(item, signal) {
  if (item.size && !(await hasRoom(item.size, short(item.key)))) {
    logWarn("offline", `Skipped (will not be saved, no retry): ${short(item.key)}`);
    const error = new Error("no room");
    error.noRetry = true;
    throw error;
  }
  const began = Date.now();
  logEvent("offline", `Downloading ${short(item.key)} (${mb(item.size)} expected)`);
  const res = await fetch(item.url, { mode: "cors", signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob(); // whole file or an error: never half a file
  if (signal.aborted) throw new Error("aborted");
  await saveBlob(item.key, blob, res.headers.get("Content-Type"));
  logEvent("offline", `Downloaded and saved ${short(item.key)}: ${mb(blob.size)} in ${((Date.now() - began) / 1000).toFixed(1)} s`);
}

async function start(item, large, mine) {
  running += 1;
  if (large) largeRunning += 1;
  const controller = new AbortController();
  controllers.add(controller);
  try {
    await (item.run ? item.run(controller.signal) : downloadFile(item, controller.signal));
    if (mine === session) {
      saved.add(item.key);
      logEvent("offline", `Saved ${saved.size} of ${wanted} files for the playing playlist`);
      emit();
    }
  } catch (error) {
    if (mine === session && !controller.signal.aborted && !error.noRetry) {
      const count = (tries.get(item.key) || 0) + 1;
      tries.set(item.key, count);
      if (count < MAX_TRIES) {
        failed.push(item);
        logWarn("offline", `Could not save ${short(item.key)}: ${error.name}: ${error.message}. Try ${count} of ${MAX_TRIES}; it will be tried again in about ${RETRY_MS / 1000} s`);
      } else {
        logWarn("offline", `Gave up on ${short(item.key)} after ${MAX_TRIES} tries (last error: ${error.name}: ${error.message})`);
      }
    } else if (controller.signal.aborted) {
      logEvent("offline", `Download stopped before it finished (nothing half-saved): ${short(item.key)}`);
    }
  } finally {
    controllers.delete(controller);
    running -= 1;
    if (large) largeRunning -= 1;
    pump(mine);
  }
}

function pump(mine) {
  if (mine !== session) return;
  while (running < MAX_PARALLEL && queue.length > 0) {
    const next = queue[0];
    const large = (next.size || 0) > SMALL_BYTES;
    if (large && largeRunning > 0) break; // a large file downloads alone
    queue.shift();
    start(next, large, mine);
  }
  if (queue.length === 0 && running === 0 && failed.length > 0 && !retryTimer) {
    logEvent("offline", `${failed.length} file(s) failed; trying them again in ${RETRY_MS / 1000} s`);
    retryTimer = setTimeout(() => {
      retryTimer = null;
      resumeDownloads();
    }, RETRY_MS);
  }
}

function abortAll() {
  controllers.forEach((c) => c.abort());
  controllers.clear();
  clearTimeout(retryTimer);
  retryTimer = null;
}

// Make the saved files match `items` (the playing playlist): delete the rest,
// then download what is missing.
export async function syncDownloads(items) {
  session += 1;
  const mine = session;
  abortAll();
  failed = [];
  tries.clear();
  wanted = items.length;
  logEvent(
    "offline",
    `Syncing saved files with the playing playlist: ${items.length} file(s) needed`,
    items.map((i) => ({ file: short(i.key), size: mb(i.size), kind: i.run ? "app" : "file" })),
  );
  await deleteExcept(new Set(items.map((i) => i.key)));
  if (mine !== session) return;

  saved = new Set();
  for (const item of items) {
    if (await isSaved(item.key)) saved.add(item.key);
  }
  if (mine !== session) return;
  emit();

  queue = items.filter((i) => !saved.has(i.key)).sort((a, b) => (a.size || 0) - (b.size || 0));
  logEvent("offline", `${saved.size} file(s) already saved, ${queue.length} to download (smallest first)`);
  if (queue.length > 0) await keepStorage();
  pump(mine);
}

// Back online: try the files that failed again.
function resumeDownloads() {
  if (failed.length === 0) return;
  clearTimeout(retryTimer);
  retryTimer = null;
  queue = [...failed, ...queue].sort((a, b) => (a.size || 0) - (b.size || 0));
  logEvent("offline", `Trying ${failed.length} failed file(s) again`);
  failed = [];
  pump(session);
}

// Offline (or leaving the page): stop. Anything half downloaded is discarded.
export function stopDownloads() {
  if (queue.length > 0 || running > 0) {
    logWarn("offline", `Downloads stopped: ${running} running and ${queue.length} waiting were dropped (the screen is offline or the page is closing)`);
  }
  session += 1;
  abortAll();
  queue = [];
  failed = [];
}


// Used by: components/screens/DevicePlayback.jsx.
