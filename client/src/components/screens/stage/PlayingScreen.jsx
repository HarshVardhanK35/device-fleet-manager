import { useRef } from "react";

import BrandLoader from "../../loading/BrandLoader.jsx";
import DevicePlayback from "../DevicePlayback.jsx";

const LONG_PRESS_MS = 900;

// Full-screen playback. Pressing and holding anywhere for about a second calls
// `onStop` (the way back out). A short note says so for a few seconds each time
// playback starts, then fades away.
function PlayingScreen({ playbackRef, screenToken, initialPosition, onStop }) {
  const timer = useRef(null);

  return (
    <div
      onPointerDown={() => {
        timer.current = setTimeout(onStop, LONG_PRESS_MS);
      }}
      onPointerUp={() => clearTimeout(timer.current)}
      onPointerLeave={() => clearTimeout(timer.current)}
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
        initialPosition={initialPosition}
        waitingView={
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(12px,3.4cqmin,170px)" }}>
            <BrandLoader size="clamp(56px,14cqmin,700px)" label={null} />
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
      <div
        role="note"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "clamp(16px,4cqmin,200px)",
          transform: "translateX(-50%)",
          width: "max-content",
          maxWidth: "90cqw",
          padding: "clamp(8px,1.6cqmin,80px) clamp(14px,2.8cqmin,140px)",
          borderRadius: 999,
          background: "rgba(13, 17, 23, 0.82)",
          color: "var(--color-neutral-100)",
          fontSize: "clamp(12px,2.3cqmin,120px)",
          textAlign: "center",
          pointerEvents: "none",
          opacity: 0,
          animation: "screens-hint 9s ease both",
        }}
      >
        To go back, press and hold the screen for 1 second.
      </div>
    </div>
  );
}

export default PlayingScreen;

// Used by: pages/Screens.jsx.
