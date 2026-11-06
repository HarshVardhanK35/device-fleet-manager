import { Play, RotateCcw, Square } from "lucide-react";

import UnpairLink from "./UnpairLink.jsx";

// "Playback stopped" with Continue / Restart (after a long press) and Unpair.
function StoppedScreen({ screenName, onContinue, onRestart, onUnpair }) {
  return (
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
      {screenName && (
        <div style={{ fontSize: "clamp(16px,3.4cqmin,170px)", color: "var(--color-accent-200)", marginTop: "calc(-1 * clamp(6px,1.6cqmin,80px))" }}>
          {screenName}
        </div>
      )}

      <div style={{ display: "flex", gap: "clamp(12px,2.8cqmin,140px)" }}>
        <button
          type="button"
          onClick={onContinue}
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
          onClick={onRestart}
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

      <UnpairLink onClick={onUnpair} />
    </div>
  );
}

export default StoppedScreen;

// Used by: pages/Screens.jsx.
