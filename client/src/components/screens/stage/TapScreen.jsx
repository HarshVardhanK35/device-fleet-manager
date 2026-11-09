import { Play } from "lucide-react";

import UnpairLink from "./UnpairLink.jsx";
import { useStageCss } from "../../../utils/screens/stageCss.js";

// "Tap to Start Playing": full screen needs one tap (a browser rule).
function TapScreen({ onStart, onUnpair }) {
  const css = useStageCss();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: css("clamp(12px,3.4cqmin,170px)") }}>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            borderRadius: 999,
            border: css("clamp(2px,0.45cqmin,22px) solid var(--color-accent-400)"),
            animation: "screens-halo 1.9s ease-out infinite",
            pointerEvents: "none",
          }}
        />
        <button
          type="button"
          onClick={onStart}
          style={{
            position: "relative",
            padding: css("clamp(14px,3.4cqmin,170px) clamp(28px,7.5cqmin,380px)"),
            borderRadius: 999,
            border: css("clamp(2px,0.5cqmin,24px) solid var(--color-accent-400)"),
            background: css("color-mix(in srgb, var(--color-accent) 16%, var(--color-section))"),
            color: "var(--color-neutral-100)",
            fontSize: css("clamp(20px,5.4cqmin,280px)"),
            fontWeight: 500,
            letterSpacing: "-0.02em",
            cursor: "pointer",
            boxShadow: css("0 0 7cqmin color-mix(in srgb, var(--color-accent) 50%, transparent)"),
          }}
        >
          {/* a <button> is not a flex box before Chromium 83, so a span lays out the icon and label */}
          <span style={{ display: "flex", alignItems: "center", gap: css("clamp(10px,2.4cqmin,120px)") }}>
            <Play style={{ width: "1em", height: "1em", color: "var(--color-accent-200)" }} fill="currentColor" />
            Tap to Start Playing
          </span>
        </button>
      </div>
      <div style={{ fontSize: css("clamp(14px,2.6cqmin,130px)"), color: "var(--color-accent-200)", textAlign: "center", maxWidth: css("90cqw") }}>
        Playback opens full-screen and runs on its own from here.
      </div>
      <UnpairLink onClick={onUnpair} />
    </div>
  );
}

export default TapScreen;

// Used by: pages/Screens.jsx.
