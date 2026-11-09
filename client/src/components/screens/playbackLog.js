import { getDownloadState } from "../../offline/downloadManager.js";
import { itemKey } from "../../offline/playlistItems.js";
import { logEvent, logWarn } from "../../utils/screenLog/screenLog.js";

// What the player writes to the screen's log about what plays and why, kept apart from the
// component. Read with the Player page's "Pull logs".

const shortKey = (key) => (key && key.length > 90 ? `…${key.slice(-87)}` : key);

// What the log snapshot says about the player at the moment the owner pulls the logs.
export function describePlayer(state) {
  if (!state) return "the player has not started yet";
  const { screenToken, online, connection, manifest, activeAssignment, contentIndex, savedKeys, itemStartedAt, turn, refreshTick, now } = state;
  const items = activeAssignment?.content || [];
  return {
    screenToken: screenToken ? `…${String(screenToken).slice(-6)}` : null,
    online,
    linkToServer: connection,
    playerClock: new Date(now).toString(),
    manifestPlaylists: (manifest?.playlists || []).map((p) => ({
      name: p.playlistName,
      items: (p.content || []).length,
      from: p.beginDT,
      until: p.endDT,
    })),
    playing: activeAssignment
      ? {
          playlist: activeAssignment.playlistName,
          from: activeAssignment.beginDT,
          until: activeAssignment.endDT,
          currentItem: contentIndex + 1,
          itemStartedAt: new Date(itemStartedAt).toString(),
          turn,
          refreshTick,
        }
      : "nothing is playing",
    items: items.map((item, i) => {
      const key = itemKey(item);
      return {
        n: i + 1,
        name: item.name,
        type: item.type,
        seconds: Math.round((item.durationInMillis || 0) / 1000),
        saved: key === null ? "nothing to save" : savedKeys.has(key),
        savedAs: shortKey(key),
      };
    }),
    downloads: getDownloadState(),
  };
}

// Why the playlist moved on, and which items it passed over.
export function logAdvance(items, from, to, skippedCurrent) {
  const why = skippedCurrent
    ? `item ${from + 1} is not saved and the screen is offline, so it is skipped`
    : `item ${from + 1} finished its time`;
  if (to === from) {
    logWarn("play", `${why}; no other item can play now (the others are not saved), so item ${from + 1} "${items[from].name}" plays again`);
    return;
  }
  const passed = [];
  for (let step = 1; step < items.length; step += 1) {
    const i = (from + step) % items.length;
    if (i === to) break;
    passed.push(`${i + 1} "${items[i].name}" (${items[i].type})`);
  }
  logEvent(
    "play",
    `${why}; next is item ${to + 1} "${items[to].name}" (${items[to].type})${passed.length ? `. Passed over because they cannot play now: ${passed.join(", ")}` : ""}`,
  );
}

// Used by: hooks/usePlaybackLog.js, components/screens/DevicePlayback.jsx.
