import { TriangleAlert } from "lucide-react";

import CodeBox from "./CodeBox.jsx";
import PulsingDots from "./PulsingDots.jsx";
import { useStageCss } from "../../../utils/screens/stageCss.js";

function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// The pairing code in two groups of four boxes.
function CodeScreen({ code }) {
  const css = useStageCss();
  const g1 = code.slice(0, 4).split("");
  const g2 = code.slice(4, 8).split("");
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: css("clamp(10px,3.6cqmin,180px)"),
      }}
    >
      <div style={{ fontSize: css("clamp(16px,3.3cqmin,170px)"), lineHeight: 1.35, color: "var(--color-neutral-200)", maxWidth: "34em" }}>
        Enter this code in the <span style={{ color: "var(--color-accent-200)", fontWeight: 500 }}>Player</span> tab of
        your CastWise account to pair this screen.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: css("min(2.6cqw,4.4cqh)") }}>
        <div style={{ display: "flex", gap: css("min(1.3cqw,2.2cqh)") }}>
          {g1.map((ch, i) => (
            <CodeBox key={i} ch={ch} />
          ))}
        </div>
        <div
          style={{
            width: css("min(1.6cqw,2.6cqh)"),
            height: css("clamp(2px,0.5cqmin,22px)"),
            borderRadius: 999,
            background: "var(--color-accent-400)",
          }}
        />
        <div style={{ display: "flex", gap: css("min(1.3cqw,2.2cqh)") }}>
          {g2.map((ch, i) => (
            <CodeBox key={i} ch={ch} />
          ))}
        </div>
      </div>
    </div>
  );
}

// The bottom row of the code screen: "Waiting for pairing", the warning about
// the code limit, and the validity countdown. The three sit in the grid areas
// defined by .screens-foot in index.css.
export function CodeFooter({ secondsLeft }) {
  const css = useStageCss();
  return (
    <>
      <div
        className="screens-foot-wait"
        style={{
          display: "flex",
          alignItems: "center",
          gap: css("clamp(8px,1.8cqmin,90px)"),
          fontSize: css("clamp(14px,2.7cqmin,140px)"),
          color: "var(--color-accent-200)",
        }}
      >
        <PulsingDots />
        Waiting for pairing
      </div>
      <div
        className="screens-foot-warn"
        role="note"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: css("clamp(8px,1.6cqmin,80px)"),
          padding: css("clamp(8px,1.8cqmin,90px) clamp(12px,2.4cqmin,120px)"),
          borderRadius: css("clamp(8px,1.6cqmin,80px)"),
          border: css("clamp(1px,0.2cqmin,10px) solid color-mix(in srgb, #e3b341 55%, transparent)"),
          background: css("color-mix(in srgb, #e3b341 12%, transparent)"),
          fontSize: css("clamp(12px,2.3cqmin,120px)"),
          lineHeight: 1.45,
          color: "var(--color-neutral-100)",
        }}
      >
        <TriangleAlert style={{ width: "1.5em", height: "1.5em", flex: "none", color: "#e3b341" }} />
        <span>
          A screen can ask for up to 20 codes per hour. Refreshing again and again can stop new codes for up to an
          hour, and a new code is already made every 15 minutes.
        </span>
      </div>
      <div
        className="screens-foot-count"
        style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: css("clamp(2px,0.6cqmin,30px)") }}
      >
        <div
          style={{
            fontSize: css("clamp(12px,2.2cqmin,110px)"),
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-accent-200)",
          }}
        >
          Code valid for
        </div>
        <div
          style={{
            fontSize: css("clamp(28px,7.6cqmin,390px)"),
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
  );
}

export default CodeScreen;

// Used by: pages/Screens.jsx.
