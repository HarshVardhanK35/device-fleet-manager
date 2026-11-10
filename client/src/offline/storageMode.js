import { logEvent, logWarn } from "../utils/screenLog/screenLog.js";

// How much this browser lets the player store. Some TV browsers allow very little (a
// Samsung TV showed 80 MB), so below LOW_QUOTA_MB the screen is in "low storage" mode:
// videos are saved (and played) at 480p so more of a playlist fits offline.
const LOW_QUOTA_MB = 300;
const STORED = "cw-low-storage";
const ASK_MS = 3000; // some TV browsers never answer; do not wait for them

function readStored() {
  try {
    return localStorage.getItem(STORED) === "1";
  } catch {
    return false;
  }
}

// Starts from what the last visit found, so the first video of a session is already right.
let low = readStored();

export const isLowStorage = () => low;
export const lowQuotaMB = () => LOW_QUOTA_MB;

const toMB = (bytes) => (bytes ? Math.round(bytes / 1048576) : null);

// What the browser says about its storage: { quotaMB, usedMB, freeMB, persisted }, or null.
export async function readStorage() {
  if (!navigator.storage?.estimate) return null;
  const answer = await Promise.race([
    navigator.storage.estimate(),
    new Promise((resolve) => setTimeout(() => resolve(null), ASK_MS)),
  ]).catch(() => null);
  if (!answer) return null;
  const persisted = navigator.storage.persisted
    ? await Promise.race([navigator.storage.persisted(), new Promise((resolve) => setTimeout(() => resolve(null), ASK_MS))]).catch(() => null)
    : null;
  return {
    quotaMB: toMB(answer.quota),
    usedMB: toMB(answer.usage) ?? 0,
    freeMB: answer.quota ? toMB(answer.quota - answer.usage) : null,
    persisted,
  };
}

// Called once when a screen page starts: decides the mode from the browser's quota.
export async function initStorageMode() {
  const info = await readStorage();
  if (!info || !info.quotaMB) {
    logWarn("offline", "This browser did not report its storage quota; keeping the video quality chosen last time (" + (low ? "480p" : "original") + ")");
    return;
  }
  low = info.quotaMB < LOW_QUOTA_MB;
  try {
    localStorage.setItem(STORED, low ? "1" : "0");
  } catch {
    // storage unavailable: the mode just applies to this visit
  }
  logEvent(
    "offline",
    `Storage quota is ${info.quotaMB} MB (${info.usedMB} MB used): ${low ? `below ${LOW_QUOTA_MB} MB, so videos are saved and played at 480p to save space` : "enough for videos at their original quality"}`,
  );
}

// Used by: main.jsx (start), offline/playlistItems.js, components/screens/PlaybackLayers.jsx,
// offline/storageReport.js.
