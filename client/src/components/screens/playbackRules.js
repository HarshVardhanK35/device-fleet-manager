import { itemKey } from "../../offline/playlistItems.js";

// The rules for "what plays now", kept apart from the player component.

// The assignment whose time window covers `nowMs`.
export function findActiveAssignment(manifest, nowMs) {
  return (
    (manifest?.playlists || []).find((p) => {
      const begin = new Date(p.beginDT).getTime();
      const end = new Date(p.endDT).getTime();
      return nowMs >= begin && nowMs <= end;
    }) || null
  );
}

// Offline, a screen plays only the playlist it was playing when it lost its
// connection, and only until that playlist's own end time.
export function findLockedAssignment(manifest, assignmentId, nowMs) {
  if (!assignmentId) return null;
  const found = (manifest?.playlists || []).find((p) => p.assignmentId === assignmentId);
  if (!found) return null;
  return nowMs >= new Date(found.beginDT).getTime() && nowMs <= new Date(found.endDT).getTime() ? found : null;
}

// An item that failed to load or play (`failedKeys`) is skipped. Offline, an item can play
// only if its file was saved; anything else is skipped too.
export function playableFor(online, savedKeys, item, failedKeys) {
  const key = itemKey(item);
  if (key !== null && failedKeys && failedKeys.has(key)) return false;
  if (online) return true;
  return key === null || savedKeys.has(key);
}

// The next item after `from` that can play (or `from` itself when none can).
export function nextPlayableIndex(items, from, online, savedKeys, failedKeys) {
  for (let step = 1; step <= items.length; step += 1) {
    const index = (from + step) % items.length;
    if (playableFor(online, savedKeys, items[index], failedKeys)) return index;
  }
  return from;
}

// Used by: components/screens/DevicePlayback.jsx.
