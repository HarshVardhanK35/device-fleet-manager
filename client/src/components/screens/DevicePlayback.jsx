import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";

import { useScreenConnection } from "../../hooks/useScreenConnection.js";
import { getSaved, stopDownloads, subscribeSaved, syncDownloads } from "../../offline/downloadManager.js";
import { downloadItems } from "../../offline/playlistItems.js";
import { registerOffline } from "../../offline/registerOffline.js";
import { savePlaying } from "../../offline/savedManifest.js";
import OfflineBanner from "./OfflineBanner.jsx";
import PlaybackLayers from "./PlaybackLayers.jsx";
import { findActiveAssignment, findLockedAssignment, nextPlayableIndex, playableFor } from "./playbackRules.js";

const FALLBACK_ITEM_MS = 8000; // used only if a content item has no/invalid durationInMillis

// The built-in messages (already connected elsewhere, taken over, nothing scheduled)
// are styled here, not left to the browser or to Tailwind's heading reset, which an
// older TV browser skips; they would otherwise look different on every browser.
const MESSAGE_STYLE = {
  margin: 0,
  fontSize: "5vmin",
  fontWeight: 600,
  color: "#e6edf3",
  fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
};

function DevicePlayback(
  {
    screenToken,
    rejectedView,
    waitingView,
    nothingScheduledView,
    takenOverView,
    initialPosition,
  },
  ref,
) {
  const [now, setNow] = useState(() => Date.now());
  const [contentIndex, setContentIndex] = useState(0);
  const [savedKeys, setSavedKeys] = useState(getSaved);
  // Goes up each time the playlist moves on (see PlaybackLayers).
  const [turn, setTurn] = useState(0);
  const activeIdRef = useRef(null);
  const videoRef = useRef(null);
  // The video on screen, so getPosition() can read how far it has played.
  const setVideoElement = useCallback((element) => {
    videoRef.current = element;
  }, []);
  // The live link to the server: manifest, connection state, whether it can
  // be reached (`online`), and which playlist may keep playing if it can't.
  const { manifest, connection, online, offlineLock, bannerOn, backOnline, refreshTick } = useScreenConnection(screenToken, {
    activeIdRef,
    setNow,
  });
  // Consumed once, right after the initial content index is derived from it
  // below — a later prop change (e.g. parent re-render) must not re-seek an
  // already-playing video. State (not a ref) because it's set during
  // render, alongside contentIndex, in the block below.
  const [initialPositionApplied, setInitialPositionApplied] = useState(false);
  const [pendingVideoSeek, setPendingVideoSeek] = useState(null);
  // When the current item started, in epoch ms — backdated on resume by
  // however much of it had already played, so the rotation effect below
  // schedules only the *remaining* time instead of the item's full
  // duration. Reset to "now" on every normal advance.
  const [itemStartedAt, setItemStartedAt] = useState(() => Date.now());

  useEffect(() => {
    registerOffline();
  }, []);

  useEffect(() => subscribeSaved(setSavedKeys), []);

  const activeAssignment = online
    ? findActiveAssignment(manifest, now)
    : findLockedAssignment(manifest, offlineLock, now);

  useEffect(() => {
    activeIdRef.current = activeAssignment?.assignmentId ?? null;
  });

  // Save the playing playlist's files while online (and delete what nothing
  // uses any more); stop while offline, so a half-downloaded file is dropped.
  useEffect(() => {
    if (!manifest) return;
    if (!online) {
      stopDownloads();
      return;
    }
    syncDownloads(downloadItems(activeAssignment?.content));
  }, [manifest, activeAssignment, online, refreshTick]);

  useEffect(() => () => stopDownloads(), []);

  // Remember which playlist is playing, so a restart with no internet knows
  // which one it may keep playing.
  useEffect(() => {
    if (online && manifest) savePlaying(screenToken, activeAssignment?.assignmentId ?? null);
  }, [online, manifest, activeAssignment, screenToken]);

  useImperativeHandle(ref, () => ({
    getPosition() {
      return {
        assignmentId: activeAssignment?.assignmentId ?? null,
        contentIndex,
        elapsedMs: Date.now() - itemStartedAt,
        videoTime: videoRef.current?.currentTime || 0,
      };
    },
  }));

  // Re-checks "what's active now" right at the next meaningful boundary —
  // the current assignment ending, or the next one beginning — instead of
  // a flat polling interval. The manifest already lists every assignment's
  // time window, so this needs no new server push to transition seamlessly
  // between back-to-back assignments (the "seamless cut" decision from
  // future-implementations.md's Preview-tab section).
  useEffect(() => {
    if (!manifest) return;
    const nowMs = Date.now();
    let nextBoundary = null;
    for (const p of manifest.playlists || []) {
      const begin = new Date(p.beginDT).getTime();
      const end = new Date(p.endDT).getTime();
      if (begin > nowMs && (nextBoundary === null || begin < nextBoundary)) nextBoundary = begin;
      if (end > nowMs && (nextBoundary === null || end < nextBoundary)) nextBoundary = end;
    }
    // Clamped: at least 1s out (avoid a tight re-render loop), at most 60s
    // (a safety-net re-check even with no upcoming boundary at all).
    const delay = nextBoundary ? Math.min(Math.max(nextBoundary - nowMs, 1000), 60000) : 30000;
    const t = setTimeout(() => setNow(Date.now()), delay);
    return () => clearTimeout(t);
  }, [manifest, now]);

  // Reset to the first item whenever the active assignment itself changes
  // (a different playlist just became active). Adjusted during render
  // (React's documented "adjusting state when a prop changes" pattern)
  // rather than in an effect, so it takes effect in the same render
  // instead of causing an extra one.
  const [prevAssignment, setPrevAssignment] = useState(activeAssignment);
  if (prevAssignment !== activeAssignment) {
    setPrevAssignment(activeAssignment);
    // A saved position only applies to the assignment it was captured
    // from — if the schedule has since moved on to a different assignment,
    // always start that one fresh at item 0.
    const canResume =
      !initialPositionApplied &&
      initialPosition &&
      activeAssignment?.assignmentId &&
      initialPosition.assignmentId === activeAssignment.assignmentId;
    setInitialPositionApplied(true);
    setPendingVideoSeek(canResume ? initialPosition.videoTime || 0 : null);
    setContentIndex(canResume ? initialPosition.contentIndex : 0);
    setItemStartedAt(canResume ? now - (initialPosition.elapsedMs || 0) : now);
    setTurn((t) => t + 1);
  }

  // "Refresh screen" from the app: start the playlist again from the first
  // item (same adjust-during-render pattern as above).
  const [seenRefresh, setSeenRefresh] = useState(refreshTick);
  if (seenRefresh !== refreshTick) {
    setSeenRefresh(refreshTick);
    setPendingVideoSeek(null);
    setContentIndex(0);
    setItemStartedAt(now);
    setTurn((t) => t + 1);
  }

  // Rotates through the active playlist's content, each item for its own
  // durationInMillis, looping back to the start. Schedules only the time
  // *remaining* in the current item (duration minus however long it's
  // already been showing since itemStartedAt) rather than always the full
  // duration — this is what makes resuming mid-item actually pick up where
  // it left off instead of replaying the whole item from scratch.
  // Offline, an item whose file was not saved is skipped at once.
  useEffect(() => {
    const items = activeAssignment?.content;
    const current = items?.[contentIndex];
    if (!current) return;
    if (!items.some((item) => playableFor(online, savedKeys, item))) return;
    const skip = !playableFor(online, savedKeys, current);
    const duration = current.durationInMillis > 0 ? current.durationInMillis : FALLBACK_ITEM_MS;
    const remaining = Math.max(duration - (Date.now() - itemStartedAt), 0);
    const t = setTimeout(
      () => {
        setContentIndex((i) => nextPlayableIndex(items, i, online, savedKeys));
        setItemStartedAt(Date.now());
        setTurn((t) => t + 1);
      },
      skip ? 0 : remaining,
    );
    return () => clearTimeout(t);
  }, [activeAssignment, contentIndex, itemStartedAt, online, savedKeys]);

  const banner = bannerOn ? <OfflineBanner /> : backOnline ? <OfflineBanner online /> : null;

  if (connection === "rejected") {
    return rejectedView ?? <div style={MESSAGE_STYLE}>This screen is already connected elsewhere.</div>;
  }

  if (connection === "taken-over") {
    return takenOverView ?? <div style={MESSAGE_STYLE}>This screen was taken over from the app.</div>;
  }

  if (!manifest) {
    return (
      <>
        {waitingView ?? <p>Waiting for manifest...</p>}
        {banner}
      </>
    );
  }

  const currentContent = activeAssignment?.content?.[contentIndex];
  const hasPlayable = !!activeAssignment?.content?.some((item) => playableFor(online, savedKeys, item));

  if (!currentContent || !hasPlayable) {
    return (
      <>
        <div style={{ textAlign: "center" }}>
          {nothingScheduledView ?? <div style={MESSAGE_STYLE}>Nothing scheduled at this time</div>}
          {!online && (
            <p style={{ margin: "1em 0 0", opacity: 0.8, fontSize: "3vmin", color: "#e6edf3" }}>
              This screen can&apos;t reach CastWise. Check its internet connection.
            </p>
          )}
        </div>
        {banner}
      </>
    );
  }

  // The next tick skips an item that is not saved (offline); show nothing meanwhile.
  if (!playableFor(online, savedKeys, currentContent)) return banner;

  return (
    <>
      <PlaybackLayers
        items={activeAssignment.content}
        contentIndex={contentIndex}
        turn={turn}
        assignmentId={activeAssignment.assignmentId}
        online={online}
        savedKeys={savedKeys}
        refreshTick={refreshTick}
        pendingVideoSeek={pendingVideoSeek}
        onSeekApplied={() => setPendingVideoSeek(null)}
        onVideoElement={setVideoElement}
      />
      {banner}
    </>
  );
}

export default forwardRef(DevicePlayback);

// The device-facing playback component: rotates through whatever is
// scheduled for this screen right now and renders it. Schedule-aware: picks
// the assignment whose beginDT/endDT window covers the current time (not
// just the first one in the manifest), re-checked right at the next relevant
// boundary so it transitions between back-to-back assignments on its own —
// and rotates through that assignment's playlist content by each item's
// durationInMillis, looping. Shows `nothingScheduledView` when no assignment
// currently covers "now".
// The live link to the server (claiming the one-connection slot, the MQTT
// manifest and take-over / release messages, the heartbeat, offline
// detection) is hooks/useScreenConnection.js; the "what plays now" rules are
// playbackRules.js; the saved files are src/offline/*.
// `rejectedView`/`waitingView`/`nothingScheduledView`/`takenOverView` let a
// caller override the default messages to match its own page's visual
// language — all optional.
// Used by: pages/Player.jsx (route "/player/:token"), pages/Screens.jsx
// (the "playing" phase, after pairing + the tap-to-start gesture).
//
// Offline (src/offline/*, public/player-sw.js):
//   - While online it saves the playing playlist's files (smallest first) and
//     the last manifest; items play from the saved copy when there is one, from
//     the network (saving a copy in the background) when there isn't.
//   - When the connection to the server drops it keeps playing the playlist it
//     was on, only until that playlist's end time (never the next one), skips
//     any item whose file is not saved, shows an OFFLINE strip (10 s every minute), and
//     then "Nothing scheduled" plus a check-your-connection line. A screen
//     that restarts with no internet does the same from the saved manifest.
//   - "Refresh screen" (sent from the Player page while the screen is online)
//     starts the playlist again from the first item and re-checks the saved
//     files; it does not reload the page, so fullscreen stays.
//   - When it reconnects it takes the live manifest; an updated playlist
//     restarts from the beginning, an unchanged one keeps playing.
//
// Resume support: forwards a ref exposing getPosition() -> { assignmentId,
// contentIndex, elapsedMs, videoTime }, read by a caller right before
// unmounting this component (e.g. Screens.jsx's long-press stop handler)
// so it can be captured and later passed back in as the `initialPosition`
// prop. On mount, `initialPosition` is only honored if its assignmentId
// still matches whatever's actually active now — if the schedule moved on
// to a different assignment in the meantime, playback always starts that
// one fresh at item 0 instead. `elapsedMs` (how long the saved item had
// already been showing) backdates `itemStartedAt` on resume, so the
// rotation effect schedules only the item's *remaining* time instead of
// its full duration — this is what makes a resumed image/video actually
// pick up mid-item instead of replaying from its own start. `videoTime`
// additionally seeks the actual `<video>` element to the right frame.
