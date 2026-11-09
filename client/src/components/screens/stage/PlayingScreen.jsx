import { useRef } from "react";

import BrandLoader from "../../loading/BrandLoader.jsx";
import DevicePlayback from "../DevicePlayback.jsx";
import { useStageCss } from "../../../utils/stageCss.js";

const LONG_PRESS_MS = 900;

// Full-screen playback. Pressing and holding anywhere for about a second calls
// `onStop` (the way back out). A short note says so for a few seconds each time
// playback starts, then fades away.
function PlayingScreen({ playbackRef, screenToken, initialPosition, onStop }) {
  const css = useStageCss();
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
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
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
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: css("clamp(12px,3.4cqmin,170px)") }}>
            <BrandLoader size={css("clamp(56px,14cqmin,700px)")} label={null} />
            <div style={{ fontSize: css("clamp(16px,3.4cqmin,170px)"), color: "var(--color-neutral-200)" }}>
              Waiting for content…
            </div>
          </div>
        }
        rejectedView={
          <div
            style={{
              textAlign: "center",
              maxWidth: css("80cqw"),
              fontSize: css("clamp(16px,3.4cqmin,170px)"),
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
          bottom: css("clamp(16px,4cqmin,200px)"),
          transform: "translateX(-50%)",
          width: "max-content",
          maxWidth: css("90cqw"),
          padding: css("clamp(8px,1.6cqmin,80px) clamp(14px,2.8cqmin,140px)"),
          borderRadius: 999,
          background: "rgba(13, 17, 23, 0.82)",
          color: "var(--color-neutral-100)",
          fontSize: css("clamp(12px,2.3cqmin,120px)"),
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
