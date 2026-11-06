import { useState, useEffect, useRef } from "react";

import { unpairDevice, disconnectDevice } from "../api/devices.js";
import CodeScreen, { CodeFooter } from "../components/screens/stage/CodeScreen.jsx";
import LoadingScreen, { LoadingFooter } from "../components/screens/stage/LoadingScreen.jsx";
import PairedScreen from "../components/screens/stage/PairedScreen.jsx";
import PlayingScreen from "../components/screens/stage/PlayingScreen.jsx";
import StageHeader from "../components/screens/stage/StageHeader.jsx";
import StoppedScreen from "../components/screens/stage/StoppedScreen.jsx";
import TapScreen from "../components/screens/stage/TapScreen.jsx";
import { THEME } from "../components/screens/stage/stageTheme.js";
import { usePairing } from "../hooks/usePairing.js";
import { forgetScreen } from "../offline/forgetScreen.js";
import { registerOffline } from "../offline/registerOffline.js";
import { clearStoredPairing } from "../utils/screenStorage.js";

function Screens() {
  const {
    phase,
    setPhase,
    code,
    secondsLeft,
    screenName,
    setScreenName,
    screenToken,
    setScreenToken,
    limited,
    retryLeft,
  } = usePairing();
  const stageRef = useRef(null);
  const playbackRef = useRef(null);
  // Position captured right before long-press stops playback, so "Continue"
  // can hand it back in as DevicePlayback's `initialPosition` prop; cleared
  // (set to null) by "Restart" instead.
  const [pendingPosition, setPendingPosition] = useState(null);

  // Offline support for this page (see src/offline/registerOffline.js).
  useEffect(() => {
    registerOffline();
  }, []);

  async function startPlaying() {
    try {
      await stageRef.current?.requestFullscreen?.();
    } catch {
      // Fullscreen can be denied/unsupported in some embedded webviews —
      // playback still proceeds windowed rather than blocking on it.
    }
    setPhase("playing");
  }

  function stopPlaying() {
    // Capture exactly where playback was before DevicePlayback unmounts —
    // this is the only moment that position is still readable.
    setPendingPosition(playbackRef.current?.getPosition() ?? null);
    // Tell the server this device is voluntarily going offline right now,
    // so an immediate Continue/Restart doesn't get wrongly 409-rejected by
    // connectDevice's own stale "still online" check (20s threshold).
    // Best-effort, fire-and-forget — doesn't block the phase transition.
    if (screenToken) disconnectDevice(screenToken).catch(() => {});
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setPhase("stopped");
  }

  function continuePlaying() {
    // Reconnect as the screen this browser already remembers, resuming
    // from the position captured on stop — DevicePlayback itself discards
    // it if the schedule has since moved to a different assignment.
    setPhase(screenToken ? "tap" : "loading");
  }

  function restartPlaying() {
    setPendingPosition(null);
    setPhase(screenToken ? "tap" : "loading");
  }

  function refresh() {
    setPendingPosition(null);
    setPhase("loading");
  }

  async function unpairThisScreen() {
    if (!screenToken) return;
    try {
      await unpairDevice(screenToken);
    } catch {
      // Best-effort — even if the request itself fails (e.g. a network
      // hiccup), still forget it locally so the TV doesn't stay stuck
      // claiming a pairing the owner clearly wants to abandon.
    }
    clearStoredPairing();
    forgetScreen(screenToken);
    setScreenToken(null);
    setScreenName("");
    setPhase("loading");
  }

  return (
    <div
      ref={stageRef}
      style={{
        ...THEME,
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        containerType: "size",
        color: "var(--color-neutral-100)",
        background: "var(--color-bg)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateRows: "auto minmax(0,1fr) auto",
          padding: "clamp(16px,5.5cqmin,320px)",
          gap: "clamp(8px,3cqmin,160px)",
          background:
            "radial-gradient(110% 90% at 0% 0%, var(--color-section-glow) 0%, transparent 58%), radial-gradient(70% 70% at 100% 100%, color-mix(in srgb, var(--color-accent-700) 60%, transparent) 0%, transparent 62%), var(--color-section)",
        }}
      >
        <StageHeader onRefresh={phase !== "loading" && phase !== "playing" ? refresh : undefined} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }}>
          {phase === "loading" && <LoadingScreen limited={limited} />}
          {phase === "code" && <CodeScreen code={code} />}
          {phase === "paired" && <PairedScreen screenName={screenName} />}
          {phase === "tap" && <TapScreen onStart={startPlaying} onUnpair={unpairThisScreen} />}
          {phase === "playing" && (
            <PlayingScreen
              playbackRef={playbackRef}
              screenToken={screenToken}
              initialPosition={pendingPosition}
              onStop={stopPlaying}
            />
          )}
          {phase === "stopped" && (
            <StoppedScreen
              screenName={screenName}
              onContinue={continuePlaying}
              onRestart={restartPlaying}
              onUnpair={unpairThisScreen}
            />
          )}
        </div>

        <div
          className={phase === "code" ? "screens-foot" : undefined}
          style={
            phase === "code"
              ? { gap: "clamp(8px,2cqmin,100px)", minHeight: "clamp(20px,9cqmin,460px)" }
              : {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: "clamp(8px,2cqmin,100px)",
                  minHeight: "clamp(20px,9cqmin,460px)",
                }
          }
        >
          {phase === "loading" && limited && <LoadingFooter retryLeft={retryLeft} />}
          {phase === "code" && <CodeFooter secondsLeft={secondsLeft} />}
        </div>
      </div>
    </div>
  );
}

export default Screens;

// Public, unauthenticated full-screen pairing page — what a physical TV/
// screen opens (route "/screens") to pair itself with an account. No
// nav/Layout chrome, same unauthenticated pattern as pages/Player.jsx.
// Built from the "Indigo Stage" Claude Design mock, variant 1a — scaled
// with CSS container-query units (cqmin/cqw/cqh via `containerType: size`
// on the root) instead of viewport units or breakpoints, so it scales
// fluidly across TV/monitor resolutions and both landscape/portrait,
// rather than jumping at fixed breakpoints. Icons are lucide-react, colors
// are the page-local indigo palette in components/screens/stage/stageTheme.js,
// intentionally more vibrant than the rest of the app's muted dark theme,
// per the 10-foot-viewing-distance brief.
//
// How it is split: this file owns the stage frame and the playback actions
// (start, stop, continue, restart, unpair); hooks/usePairing.js owns the
// pairing side (the phase, the code and its countdown, the paired-detection
// poll, the "too many codes" wait); each phase is a component in
// components/screens/stage/ (LoadingScreen, CodeScreen, PairedScreen,
// TapScreen, PlayingScreen, StoppedScreen); what the browser remembers is in
// utils/screenStorage.js.
//
// Real backend wiring: code generation/expiry (api/pairing.js), the
// paired-detection poll, and the "playing" phase (components/screens/
// DevicePlayback.jsx — the same connect/heartbeat/MQTT/render logic
// pages/Player.jsx uses, not a separate copy) are all real, not simulated.
// The "tap to start" -> fullscreen and the long-press -> exit-fullscreen
// interactions are real too (Fullscreen API + Pointer Events).
//
// Remembers its own pairing (localStorage) so this browser doesn't have to
// re-pair from scratch every time the tab reloads or playback is stopped —
// on mount, a remembered screenToken is confirmed to still exist
// (GET /devices/:token/exists) and, if so, goes straight to "tap" to
// reconnect as that same screen; only pairs fresh if nothing's remembered or
// the remembered screen was removed from the account.
// "Unpair this screen" (on the tap and stopped screens) explicitly deletes
// the device (DELETE /devices/:token/unpair), clears this memory and the
// files and manifest the screen saved for offline use — see
// future-implementations.md's Preview-tab section for why that endpoint has
// to be unauthenticated and the tradeoff that comes with it.
//
// screenToken is Device.accessToken (a long random public token), never
// the real Mongo _id — Phase 3 fix, 2026-10-12. This is what makes the
// unauthenticated /connect|exists|unpair|disconnect routes and this
// browser's localStorage safe to expose: the value is unguessable and
// revocable, unlike the raw _id this used to be keyed by.
//
// "Stopped" phase shows two buttons: "Continue" resumes DevicePlayback from
// the exact position captured (via its forwarded ref's getPosition()) the
// moment long-press triggered stopPlaying(); "Restart" discards that
// captured position so it starts the current item fresh at the top. Both
// just flip back through "tap" (or "loading" as a fallback) — the real
// difference is only in what `pendingPosition` holds when DevicePlayback
// next mounts.
//
// stopPlaying() also fires POST /devices/:id/disconnect (best-effort, not
// awaited) the moment long-press triggers — tells the server this device
// is voluntarily going offline so a fast Continue/Restart right after
// isn't wrongly 409-rejected by connectDevice's own "still online within
// the last 20s" check.
// Used by: App.jsx (route "/screens", public, outside ProtectedRoute).
