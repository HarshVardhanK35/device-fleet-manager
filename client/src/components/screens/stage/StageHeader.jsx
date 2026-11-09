import { RefreshCw } from "lucide-react";

import Logo from "../../layout/Logo.jsx";
import { useStageCss } from "../../../utils/screens/stageCss.js";

// The top row of the /screens page: logo and name on the left, and (when
// `onRefresh` is given) a refresh icon on the right.
function StageHeader({ onRefresh }) {
  const css = useStageCss();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: css("clamp(8px,1.8cqmin,90px)") }}>
      <div
        style={{
          width: css("clamp(30px,6.6cqmin,340px)"),
          height: css("clamp(30px,6.6cqmin,340px)"),
          borderRadius: css("clamp(6px,1.5cqmin,70px)"),
          border: css("clamp(1.5px,0.32cqmin,14px) solid var(--color-accent-400)"),
          display: "grid",
          placeItems: "center",
          boxShadow: css("0 0 4cqmin color-mix(in srgb, var(--color-accent) 45%, transparent)"),
        }}
      >
        <Logo size={css("clamp(16px,3.8cqmin,190px)")} />
      </div>
      <div style={{ fontSize: css("clamp(16px,3.5cqmin,180px)"), fontWeight: 500, letterSpacing: "-0.015em" }}>
        CastWise
      </div>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          title="Refresh (a screen can ask for up to 20 codes per hour)"
          aria-label="Refresh"
          style={{
            marginLeft: "auto",
            position: "relative",
            width: css("clamp(30px,6.6cqmin,340px)"),
            height: css("clamp(30px,6.6cqmin,340px)"),
            padding: 0,
            borderRadius: css("clamp(6px,1.5cqmin,70px)"),
            border: css("clamp(1.5px,0.32cqmin,14px) solid var(--color-accent-400)"),
            background: "transparent",
            color: "var(--color-accent-200)",
            cursor: "pointer",
          }}
        >
          {/* a <button> cannot be a grid / flex box before Chromium 83, so this inner
              box does the centring */}
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RefreshCw style={{ width: "50%", height: "50%" }} />
          </span>
        </button>
      )}
    </div>
  );
}

export default StageHeader;

// Used by: pages/Screens.jsx.
