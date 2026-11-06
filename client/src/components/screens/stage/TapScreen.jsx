import { Play } from "lucide-react";

import UnpairLink from "./UnpairLink.jsx";

// "Tap to Start Playing": full screen needs one tap (a browser rule).
function TapScreen({ onStart, onUnpair }) {
  return (
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
          onClick={onStart}
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
      <UnpairLink onClick={onUnpair} />
    </div>
  );
}

export default TapScreen;

// Used by: pages/Screens.jsx.
