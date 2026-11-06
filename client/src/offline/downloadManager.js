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
  if (item.size && !(await hasRoom(item.size))) {
    console.warn("[offline] not enough space, skipped:", item.key);
    const error = new Error("no room");
    error.noRetry = true;
    throw error;
  }
  const res = await fetch(item.url, { mode: "cors", signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob(); // whole file or an error: never half a file
  if (signal.aborted) throw new Error("aborted");
  await saveBlob(item.key, blob, res.headers.get("Content-Type"));
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
      emit();
    }
  } catch (error) {
    if (mine === session && !controller.signal.aborted && !error.noRetry) {
      const count = (tries.get(item.key) || 0) + 1;
      tries.set(item.key, count);
      if (count < MAX_TRIES) failed.push(item);
      else console.warn("[offline] gave up after", MAX_TRIES, "tries:", item.key);
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
  await deleteExcept(new Set(items.map((i) => i.key)));
  if (mine !== session) return;

  saved = new Set();
  for (const item of items) {
    if (await isSaved(item.key)) saved.add(item.key);
  }
  if (mine !== session) return;
  emit();

  queue = items.filter((i) => !saved.has(i.key)).sort((a, b) => (a.size || 0) - (b.size || 0));
  if (queue.length > 0) await keepStorage();
  pump(mine);
}

// Back online: try the files that failed again.
function resumeDownloads() {
  if (failed.length === 0) return;
  clearTimeout(retryTimer);
  retryTimer = null;
  queue = [...failed, ...queue].sort((a, b) => (a.size || 0) - (b.size || 0));
  failed = [];
  pump(session);
}

// Offline (or leaving the page): stop. Anything half downloaded is discarded.
export function stopDownloads() {
  session += 1;
  abortAll();
  queue = [];
  failed = [];
}


// Used by: components/screens/DevicePlayback.jsx.
