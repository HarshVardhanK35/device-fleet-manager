import { useEffect, useRef } from "react";

import { playableFor } from "../components/screens/playbackRules.js";
import { describePlayer } from "../components/screens/playbackLog.js";
import { logEvent, logWarn } from "../utils/screenLog/screenLog.js";
import { setSnapshotProvider } from "../utils/screenLog/screenSnapshot.js";

// Writes what the player is doing to the screen's log (which playlist plays and why, each
// item shown, nothing playable, a refresh) and tells the log snapshot how to describe the
// player when the owner pulls the logs. Only reads what it is given; changes nothing.
export function usePlaybackLog({
  screenToken,
  online,
  connection,
  manifest,
  activeAssignment,
  contentIndex,
  savedKeys,
  itemStartedAt,
  turn,
  refreshTick,
  now,
}) {
  const latest = useRef(null);
  useEffect(() => {
    latest.current = { screenToken, online, connection, manifest, activeAssignment, contentIndex, savedKeys, itemStartedAt, turn, refreshTick, now };
  });
  useEffect(() => {
    setSnapshotProvider(() => describePlayer(latest.current));
    return () => setSnapshotProvider(null);
  }, []);

  useEffect(() => {
    logEvent("connect", `Link to the server: ${connection}`);
  }, [connection]);

  useEffect(() => {
    if (!manifest) return;
    if (activeAssignment) {
      logEvent(
        "play",
        `Playing playlist "${activeAssignment.playlistName}" (${activeAssignment.content.length} items, from ${activeAssignment.beginDT} until ${activeAssignment.endDT}) because ${online ? "it is the one scheduled right now" : "the screen is offline and this was the playing playlist (kept until its end time)"}`,
      );
    } else {
      logWarn(
        "play",
        `Nothing to play: ${online ? "no playlist is scheduled for this moment" : "the screen is offline and the playlist that was playing has ended, or none was playing"} (${(manifest.playlists || []).length} playlist(s) in the manifest)`,
      );
    }
  }, [manifest, activeAssignment, online]);

  useEffect(() => {
    const items = activeAssignment?.content;
    const item = items?.[contentIndex];
    if (!item) return;
    logEvent("play", `Showing item ${contentIndex + 1} of ${items.length}: "${item.name}" (${item.type}, ${Math.round((item.durationInMillis || 0) / 1000)} s)`);
  }, [activeAssignment, contentIndex, turn]);

  useEffect(() => {
    const items = activeAssignment?.content;
    if (!items?.length) return;
    if (!items.some((item) => playableFor(online, savedKeys, item))) {
      logWarn("play", `None of the ${items.length} items can play: the screen is ${online ? "online" : "offline"} and no item's file is saved`);
    }
  }, [activeAssignment, online, savedKeys]);

  useEffect(() => {
    if (refreshTick > 0) logEvent("play", "Refresh screen: starting the playlist again from item 1");
  }, [refreshTick]);
}

// Used by: components/screens/DevicePlayback.jsx.
