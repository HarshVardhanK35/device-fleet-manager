import { useState, useEffect, useRef } from "react";
import { MonitorPlay, Check, Play, Square, RotateCcw } from "lucide-react";

import { generatePairingCode, getPairingStatus } from "../api/pairing.js";
import { checkDeviceExists, unpairDevice, disconnectDevice } from "../api/devices.js";
import DevicePlayback from "../components/DevicePlayback.jsx";

const CODE_SECONDS = 15 * 60;
const STATUS_POLL_MS = 2000;

// This browser's memory of its own pairing — once a physical screen pairs
// successfully, it shouldn't have to re-pair from scratch every time the
// tab reloads or playback is stopped. Scoped to this one browser/device,
// same as how real signage hardware remembers its own setup.
const STORAGE_KEY = "dfm.screen.pairing";

function readStoredPairing() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.screenToken ? parsed : null;
  } catch {
    return null;
  }
}

function storePairing(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private browsing / storage disabled — the screen just won't
    // remember itself across reloads; pairing still works either way.
  }
}

function clearStoredPairing() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const THEME = {
  "--color-bg": "#151235",
  "--color-section": "#211c4a",
  "--color-section-glow": "#4c3f99",
  "--color-accent": "#7c78e8",
  "--color-accent-100": "#f1f0ff",
  "--color-accent-200": "#b7b4f2",
  "--color-accent-400": "#8d89e8",
  "--color-accent-700": "#4b3f8f",
  "--color-neutral-100": "#f5f4ff",
  "--color-neutral-200": "#c7c5e6",
  "--color-neutral-400": "#726fae",
};

function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function CodeBox({ ch }) {
  return (
    <div
      style={{
        width: "min(8.4cqw,14.5cqh)",
        height: "calc(min(8.4cqw,14.5cqh) * 1.22)",
        display: "grid",
        placeItems: "center",
        border: "clamp(1.5px,0.36cqmin,16px) solid var(--color-accent-400)",
        borderRadius: "clamp(6px,1.4cqmin,64px)",
        background: "color-mix(in srgb, var(--color-bg) 50%, transparent)",
        boxShadow: "0 0 3cqmin color-mix(in srgb, var(--color-accent) 28%, transparent)",
        fontSize: "calc(min(8.4cqw,14.5cqh) * 0.62)",
        fontWeight: 500,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        color: "var(--color-neutral-100)",
      }}
    >
      {ch}
    </div>
  );
}

function PulsingDots() {
  return (
    <div style={{ display: "flex", gap: "clamp(4px,0.9cqmin,44px)" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "clamp(6px,1.2cqmin,60px)",
            height: "clamp(6px,1.2cqmin,60px)",
            borderRadius: "50%",
            background: "var(--color-accent-400)",
            animation: `screens-pulse 1.4s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Screens() {
  const [phase, setPhase] = useState("loading"); // loading|code|paired|tap|playing|stopped
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(CODE_SECONDS);
  const [screenName, setScreenName] = useState("");
  const [screenToken, setScreenToken] = useState(null);
  const stageRef = useRef(null);
  const longPressTimer = useRef(null);
  const playbackRef = useRef(null);
  // Position captured right before long-press stops playback, so "Continue"
  // can hand it back in as DevicePlayback's `initialPosition` prop; cleared
  // (set to null) by "Restart" instead.
  const [pendingPosition, setPendingPosition] = useState(null);

  // First checks whether this browser already remembers a pairing — if
  // so, confirms it still exists server-side (it may have been removed
  // from the account) and skips straight to reconnecting as that same
  // screen, no new code needed. Otherwise generates a fresh code, same as
  // before. Retries on failure (network hiccup, rate limit, etc.) rather
  // than getting stuck — the TV has no one to show an error to, so it
  // just keeps trying.
  useEffect(() => {
    if (phase !== "loading") return;
    let cancelled = false;

    async function attempt() {
      const stored = readStoredPairing();
      if (stored) {
        try {
          const check = await checkDeviceExists(stored.screenToken);
          if (cancelled) return;
          if (check?.exists) {
            setScreenToken(stored.screenToken);
            setScreenName(stored.screenName || "");
            setPhase("tap");
            return;
          }
          // Confirmed gone (removed from the account) — fall through to
          // a fresh pairing below instead of retrying this screen.
          clearStoredPairing();
        } catch {
          // Network hiccup — don't throw away a valid remembered pairing
          // over this, just retry the whole check shortly.
          if (!cancelled) setTimeout(attempt, 3000);
          return;
        }
      }

      try {
        const data = await generatePairingCode();
        if (cancelled) return;
        if (!data?.code) throw new Error(data?.message || "generate failed");
        setCode(data.code);
        const remaining = Math.round((new Date(data.expiresAt).getTime() - Date.now()) / 1000);
        setSecondsLeft(Math.max(0, remaining));
        setPhase("code");
      } catch {
        if (!cancelled) setTimeout(attempt, 3000);
      }
    }

    attempt();
    return () => {
      cancelled = true;
    };
  }, [phase]);

  // Ticks the countdown down to 0, then goes back through "loading" —
  // the countdown hitting zero IS the refresh, automatic, no manual
  // action — which re-triggers the generate effect above for a fresh code.
  useEffect(() => {
    if (phase !== "code") return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setPhase("loading");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Polls the real backend for the phone-side pairing confirmation —
  // this is what actually detects a real "Pair screen" submit from
  // PlayerSlots.jsx, no more click-to-simulate.
  useEffect(() => {
    if (phase !== "code" || !code) return;
    let cancelled = false;
    const t = setInterval(async () => {
      try {
        const data = await getPairingStatus(code);
        if (cancelled || data?.status !== "claimed") return;
        setScreenName(data.screenName || "");
        setScreenToken(data.screenToken || null);
        if (data.screenToken) {
          storePairing({ screenToken: data.screenToken, screenName: data.screenName || "" });
        }
        setPhase("paired");
      } catch {
        // Network hiccup — just try again on the next tick.
      }
    }, STATUS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [phase, code]);

  useEffect(() => {
    if (phase !== "paired") return;
    const t = setTimeout(() => setPhase("tap"), 1500);
    return () => clearTimeout(t);
  }, [phase]);

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
    setScreenToken(null);
    setScreenName("");
    setPhase("loading");
  }

  function handlePointerDown() {
    longPressTimer.current = setTimeout(stopPlaying, 900);
  }

  function cancelLongPress() {
    clearTimeout(longPressTimer.current);
  }

  const g1 = code.slice(0, 4).split("");
  const g2 = code.slice(4, 8).split("");

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
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px,1.8cqmin,90px)" }}>
          <div
            style={{
              width: "clamp(30px,6.6cqmin,340px)",
              aspectRatio: 1,
              borderRadius: "clamp(6px,1.5cqmin,70px)",
              border: "clamp(1.5px,0.32cqmin,14px) solid var(--color-accent-400)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 4cqmin color-mix(in srgb, var(--color-accent) 45%, transparent)",
            }}
          >
            <MonitorPlay
              style={{ width: "clamp(16px,3.8cqmin,190px)", height: "clamp(16px,3.8cqmin,190px)", color: "var(--color-accent-200)" }}
            />
          </div>
          <div style={{ fontSize: "clamp(16px,3.5cqmin,180px)", fontWeight: 500, letterSpacing: "-0.015em" }}>
            Device Fleet Manager
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }}>
          {phase === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(12px,3.4cqmin,170px)" }}>
              <div
                style={{
                  width: "clamp(40px,10cqmin,520px)",
                  height: "clamp(40px,10cqmin,520px)",
                  borderRadius: "50%",
                  border: "clamp(3px,0.75cqmin,36px) solid color-mix(in srgb, var(--color-accent-200) 20%, transparent)",
                  borderTopColor: "var(--color-accent-200)",
                  animation: "screens-spin 0.9s linear infinite",
                }}
              />
              <div style={{ fontSize: "clamp(16px,3.4cqmin,170px)", color: "var(--color-neutral-200)" }}>
                Connecting…
              </div>
            </div>
          )}

          {phase === "code" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "clamp(10px,3.6cqmin,180px)",
              }}
            >
              <div style={{ fontSize: "clamp(16px,3.3cqmin,170px)", lineHeight: 1.35, color: "var(--color-neutral-200)", maxWidth: "34em" }}>
                Enter this code in the{" "}
                <span style={{ color: "var(--color-accent-200)", fontWeight: 500 }}>Player</span> tab of your
                Device Fleet Manager account to pair this screen.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "min(2.6cqw,4.4cqh)" }}>
                <div style={{ display: "flex", gap: "min(1.3cqw,2.2cqh)" }}>
                  {g1.map((ch, i) => (
                    <CodeBox key={i} ch={ch} />
                  ))}
                </div>
                <div
                  style={{
                    width: "min(1.6cqw,2.6cqh)",
                    height: "clamp(2px,0.5cqmin,22px)",
                    borderRadius: 999,
                    background: "var(--color-accent-400)",
                  }}
                />
                <div style={{ display: "flex", gap: "min(1.3cqw,2.2cqh)" }}>
                  {g2.map((ch, i) => (
                    <CodeBox key={i} ch={ch} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {phase === "paired" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "clamp(10px,2.6cqmin,130px)" }}>
              <div
                style={{
                  width: "clamp(56px,15cqmin,780px)",
                  aspectRatio: 1,
                  borderRadius: "50%",
                  border: "clamp(2px,0.5cqmin,26px) solid var(--color-accent-400)",
                  background: "color-mix(in srgb, var(--color-accent) 18%, transparent)",
                  boxShadow: "0 0 6cqmin color-mix(in srgb, var(--color-accent) 50%, transparent)",
                  display: "grid",
                  placeItems: "center",
                  animation: "screens-pop 0.6s cubic-bezier(.2,.8,.3,1) both",
                }}
              >
                <Check style={{ width: "48%", height: "48%", color: "var(--color-accent-100)" }} strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: "clamp(16px,3.4cqmin,170px)", color: "var(--color-accent-200)", marginTop: "clamp(6px,1.6cqmin,80px)" }}>
                Paired as
              </div>
              <div style={{ fontSize: "clamp(32px,10cqmin,520px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {screenName}
              </div>
            </div>
          )}

          {phase === "tap" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(12px,3.4cqmin,170px)" }}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 999,
                    border: "clamp(2px,0.45cqmin,22px) solid var(--color-accent-400)",
                    animation: "screens-halo 1.9s ease-out infinite",
                    pointerEvents: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={startPlaying}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: "clamp(10px,2.4cqmin,120px)",
                    padding: "clamp(14px,3.4cqmin,170px) clamp(28px,7.5cqmin,380px)",
                    borderRadius: 999,
                    border: "clamp(2px,0.5cqmin,24px) solid var(--color-accent-400)",
                    background: "color-mix(in srgb, var(--color-accent) 16%, var(--color-section))",
                    color: "var(--color-neutral-100)",
                    fontSize: "clamp(20px,5.4cqmin,280px)",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    cursor: "pointer",
                    boxShadow: "0 0 7cqmin color-mix(in srgb, var(--color-accent) 50%, transparent)",
                  }}
                >
                  <Play style={{ width: "1em", height: "1em", color: "var(--color-accent-200)" }} fill="currentColor" />
                  Tap to Start Playing
                </button>
              </div>
              <div style={{ fontSize: "clamp(14px,2.6cqmin,130px)", color: "var(--color-accent-200)", textAlign: "center", maxWidth: "90cqw" }}>
                Playback opens full-screen and runs on its own from here.
              </div>
            </div>
          )}

          {phase === "playing" && (
            <div
              onPointerDown={handlePointerDown}
              onPointerUp={cancelLongPress}
              onPointerLeave={cancelLongPress}
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                background: "var(--color-bg)",
                cursor: "pointer",
              }}
            >
              <DevicePlayback
                ref={playbackRef}
                screenToken={screenToken}
                initialPosition={pendingPosition}
                waitingView={
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(12px,3.4cqmin,170px)" }}>
                    <div
                      style={{
                        width: "clamp(40px,10cqmin,520px)",
                        height: "clamp(40px,10cqmin,520px)",
                        borderRadius: "50%",
                        border: "clamp(3px,0.75cqmin,36px) solid color-mix(in srgb, var(--color-accent-200) 20%, transparent)",
                        borderTopColor: "var(--color-accent-200)",
                        animation: "screens-spin 0.9s linear infinite",
                      }}
                    />
                    <div style={{ fontSize: "clamp(16px,3.4cqmin,170px)", color: "var(--color-neutral-200)" }}>
                      Waiting for content…
                    </div>
                  </div>
                }
                rejectedView={
                  <div
                    style={{
                      textAlign: "center",
                      maxWidth: "80cqw",
                      fontSize: "clamp(16px,3.4cqmin,170px)",
                      color: "var(--color-neutral-200)",
                    }}
                  >
                    This screen is already connected elsewhere.
                  </div>
                }
              />
            </div>
          )}

          {phase === "stopped" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(20px,5cqmin,260px)" }}>
              <div
                style={{
                  width: "clamp(44px,11cqmin,560px)",
                  aspectRatio: 1,
                  borderRadius: "50%",
                  border: "clamp(1.5px,0.36cqmin,16px) solid var(--color-neutral-400)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Square
                  style={{ width: "clamp(18px,4.4cqmin,220px)", height: "clamp(18px,4.4cqmin,220px)", color: "var(--color-neutral-200)" }}
                  fill="currentColor"
                />
              </div>
              <div style={{ fontSize: "clamp(24px,6.4cqmin,330px)", fontWeight: 500, letterSpacing: "-0.02em" }}>
                Playback stopped
              </div>

              <div style={{ display: "flex", gap: "clamp(12px,2.8cqmin,140px)" }}>
                <button
                  type="button"
                  onClick={continuePlaying}
                  title="Resume from where it stopped"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "clamp(8px,1.8cqmin,90px)",
                    padding: "clamp(12px,2.8cqmin,140px) clamp(22px,5.4cqmin,270px)",
                    borderRadius: 999,
                    border: "clamp(2px,0.42cqmin,20px) solid var(--color-accent-400)",
                    background: "color-mix(in srgb, var(--color-accent) 16%, var(--color-section))",
                    color: "var(--color-neutral-100)",
                    fontSize: "clamp(16px,3.6cqmin,180px)",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <Play style={{ width: "1em", height: "1em", color: "var(--color-accent-200)" }} fill="currentColor" />
                  Continue
                </button>

                <button
                  type="button"
                  onClick={restartPlaying}
                  title="Start the current item from the top"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "clamp(8px,1.8cqmin,90px)",
                    padding: "clamp(12px,2.8cqmin,140px) clamp(22px,5.4cqmin,270px)",
                    borderRadius: 999,
                    border: "clamp(2px,0.42cqmin,20px) solid var(--color-neutral-400)",
                    background: "transparent",
                    color: "var(--color-neutral-100)",
                    fontSize: "clamp(16px,3.6cqmin,180px)",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw style={{ width: "1em", height: "1em", color: "var(--color-neutral-200)" }} />
                  Restart
                </button>
              </div>

              <button
                type="button"
                onClick={unpairThisScreen}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  fontSize: "clamp(13px,2.4cqmin,120px)",
                  color: "var(--color-neutral-400)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                Unpair this screen
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "clamp(8px,2cqmin,100px)",
            minHeight: "clamp(20px,9cqmin,460px)",
          }}
        >
          {phase === "code" && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(8px,1.8cqmin,90px)",
                  fontSize: "clamp(14px,2.7cqmin,140px)",
                  color: "var(--color-accent-200)",
                }}
              >
                <PulsingDots />
                Waiting for pairing
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "clamp(2px,0.6cqmin,30px)" }}>
                <div
                  style={{
                    fontSize: "clamp(12px,2.2cqmin,110px)",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-accent-200)",
                  }}
                >
                  Code valid for
                </div>
                <div
                  style={{
                    fontSize: "clamp(28px,7.6cqmin,390px)",
                    fontWeight: 500,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatCountdown(secondsLeft)}
                </div>
              </div>
            </>
          )}
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
// rather than jumping at fixed breakpoints. Icons are lucide-react
// (MonitorPlay/Check/Play/Square), substituted for the mock's Phosphor
// icons to match this app's icon library; colors are a page-local indigo
// palette (not pixel-exact to the mock's internal design-system tokens,
// which aren't retrievable from the exported file) set as CSS custom
// properties on the root, intentionally more vibrant than the rest of the
// app's muted dark theme, per the 10-foot-viewing-distance brief.
//
// Real backend wiring: code generation/expiry (api/pairing.js), the
// paired-detection poll, and the "playing" phase (components/
// DevicePlayback.jsx — the same connect/heartbeat/MQTT/render logic
// pages/Player.jsx uses, not a separate copy) are all real, not simulated.
// The "tap to start" -> fullscreen and the long-press -> exit-fullscreen
// interactions are real too (Fullscreen API + Pointer Events).
//
// Remembers its own pairing (localStorage, STORAGE_KEY) so this browser
// doesn't have to re-pair from scratch every time the tab reloads or
// playback is stopped — on mount, a remembered screenToken is confirmed
// to still exist (GET /devices/:token/exists) and, if so, goes straight
// to "tap" to reconnect as that same screen; only pairs fresh if
// nothing's remembered or the remembered screen was removed from the
// account.
// "Unpair this screen" (shown on the "stopped" state) explicitly deletes
// the device (DELETE /devices/:token/unpair) and clears this memory —
// see future-implementations.md's Preview-tab section for why that
// endpoint has to be unauthenticated and the tradeoff that comes with it.
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
