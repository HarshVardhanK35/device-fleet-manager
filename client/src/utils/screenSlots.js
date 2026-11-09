import { timeAgo } from "./timeAgo.js";

// Must match the backend's code length (server/controllers/pairingController.js's
// ALPHABET loop) — both sides of the same pairing flow have to agree on the
// code shape.
export const PAIRING_CODE_LENGTH = 8;

// Picks whichever assignment currently covers "now" for this device (same
// simple beginDT/endDT comparison as components/DevicePlayback.jsx — just
// evaluated once on fetch, not live/MQTT-driven) and returns its playlist's
// first content item, shaped for ScreenThumb. Not a live mirror of what's
// actually on the physical screen right now — see future-implementations.md
// for that (deferred, needs MQTT).
export function computePlaying(assignments, deviceId) {
  const now = Date.now();
  const active = assignments.find((a) => {
    if (!a.deviceId || a.deviceId._id !== deviceId) return false;
    const begin = a.beginDT ? new Date(a.beginDT).getTime() : -Infinity;
    const end = new Date(a.endDT).getTime();
    return now >= begin && now <= end;
  });

  // Skipped slots are not played, so they are not "what is playing" either.
  const skipped = new Set(active?.playlistId?.skippedSlots ?? []);
  const items = active?.playlistId?.contentItems?.filter((item, index) => !skipped.has(index));
  const first = items?.[0];
  if (!first) return null;

  return {
    type: first.type,
    name: first.name,
    mediaUrl: first.mediaUrl,
    thumbnailUrl: first.thumbnailUrl,
    playlistName: active.playlistId.name,
    pos: items.length > 1 ? `1 of ${items.length}` : null,
    nextName: items[1]?.name || null,
  };
}

// Maps a real backend Device into the Player page's local "screen" shape.
// `res` has no backend source yet (no resolution reporting) — shown as
// unknown rather than invented.
export function mapDevice(d, playing = null) {
  return {
    id: d._id,
    name: d.name,
    type: d.type || "",
    pending: false,
    // "taken" comes from the server, so it survives leaving the page and coming back.
    status: d.takenOver ? "taken" : d.status,
    seen: d.takenOver
      ? "Physical screen disconnected"
      : d.status === "online"
        ? "Online now"
        : `Last seen ${timeAgo(d.lastSeenAt)}`,
    res: "—",
    playing,
  };
}

// Used by: hooks/useScreenSlots.js, components/screens/slots/PairingPanel.jsx.
