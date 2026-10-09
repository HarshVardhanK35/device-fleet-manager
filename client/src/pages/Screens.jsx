import { useState, useEffect, useRef } from "react";
import { MonitorPlay, Check, Play, Square } from "lucide-react";

const CODE_LENGTH = 8;
const CODE_SECONDS = 15 * 60;
// No ambiguous characters (no O/0, I/1) — this is read off a TV from across a room.
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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

function generateCode() {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

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
  const [screenName] = useState("Lobby TV"); // seed name — real pairing response supplies this later
  const stageRef = useRef(null);
  const longPressTimer = useRef(null);

  useEffect(() => {
    if (phase !== "loading") return;
    const t = setTimeout(() => {
      setCode(generateCode());
      setSecondsLeft(CODE_SECONDS);
      setPhase("code");
    }, 900);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "code") return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setCode(generateCode());
          return CODE_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "paired") return;
    const t = setTimeout(() => setPhase("tap"), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  function simulatePaired() {
    // Dev stand-in for the real phone-side pairing confirmation — no
    // backend/poll exists yet, so clicking the code card simulates it.
    if (phase === "code") setPhase("paired");
  }

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
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setPhase("stopped");
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
                Generating your pairing code…
              </div>
            </div>
          )}

          {phase === "code" && (
            <button
              type="button"
              onClick={simulatePaired}
              title="(dev) click to simulate pairing — no backend yet"
              style={{
                all: "unset",
                cursor: "pointer",
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
            </button>
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
                background: "repeating-linear-gradient(135deg, #0d0b22 0 2cqmin, var(--color-bg) 2cqmin 4cqmin)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "clamp(6px,1.4cqmin,70px)",
                  padding: "clamp(12px,3cqmin,150px) clamp(16px,4cqmin,200px)",
                  borderRadius: "clamp(8px,1.6cqmin,80px)",
                  background: "var(--color-bg)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "clamp(16px,3.4cqmin,170px)", fontWeight: 500 }}>Playlist content plays here</div>
                <div style={{ fontSize: "clamp(13px,2.4cqmin,120px)", color: "var(--color-neutral-400)" }}>
                  Long-press anywhere to stop playback
                </div>
              </div>
            </div>
          )}

          {phase === "stopped" && (
            <button
              type="button"
              onClick={() => setPhase("loading")}
              title="(dev) click to restart the pairing cycle"
              style={{
                all: "unset",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "clamp(12px,3cqmin,150px)",
              }}
            >
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
            </button>
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
// UI-only, no backend yet (none exists for this feature): `code`/
// `secondsLeft` are generated and counted down locally, and the
// loading->code->paired transition is simulated — clicking the code card
// stands in for the real phone-side pairing confirmation (there's no poll/
// WebSocket to receive that from yet). The "tap to start" -> fullscreen
// and the long-press -> exit-fullscreen interactions ARE real (Fullscreen
// API + Pointer Events), not simulated, so both are testable on a laptop
// browser today. The "playing" state is a static placeholder — real
// playback should reuse Player.jsx's existing manifest-rendering logic
// when this gets wired up, not be rebuilt here.
// Used by: App.jsx (route "/screens", public, outside ProtectedRoute).
