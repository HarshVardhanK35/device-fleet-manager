import BrandLoader from "../../loading/BrandLoader.jsx";
import Logo from "../../layout/Logo.jsx";
import PulsingDots from "./PulsingDots.jsx";
import { useStageCss } from "../../../utils/screens/stageCss.js";

// "Connecting…", or, while the server refuses new codes, the static logo with
// an explanation (the counter itself is LoadingFooter).
function LoadingScreen({ limited }) {
  const css = useStageCss();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: css("clamp(12px,3.4cqmin,170px)") }}>
      {limited ? <Logo size={css("clamp(56px,14cqmin,700px)")} /> : <BrandLoader size={css("clamp(56px,14cqmin,700px)")} label={null} />}
      <div style={{ fontSize: css("clamp(16px,3.4cqmin,170px)"), color: "var(--color-neutral-200)" }}>
        {limited ? "Too many codes requested" : "Connecting…"}
      </div>
      {limited && (
        <div
          style={{
            maxWidth: css("min(70cqw, 1400px)"),
            textAlign: "center",
            lineHeight: 1.5,
            fontSize: css("clamp(13px,2.4cqmin,120px)"),
            color: "var(--color-neutral-400)",
          }}
        >
          A screen can ask for up to 20 codes per hour. Each Refresh asks for one, and a new code is also made every 15
          minutes. When the counter below reaches 00:00, this screen asks again by itself and a new code appears within
          a second. Please don&apos;t refresh this page before then.
        </div>
      )}
    </div>
  );
}

// The bottom row while the server refuses new codes: "Waiting for new codes"
// and a mm:ss counter.
export function LoadingFooter({ retryLeft }) {
  const css = useStageCss();
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: css("clamp(8px,1.8cqmin,90px)"),
          fontSize: css("clamp(14px,2.7cqmin,140px)"),
          color: "var(--color-accent-200)",
        }}
      >
        <PulsingDots />
        Waiting for new codes
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: css("clamp(2px,0.6cqmin,30px)") }}>
        <div
          style={{
            fontSize: css("clamp(12px,2.2cqmin,110px)"),
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-accent-200)",
          }}
        >
          New code in
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
          {String(Math.floor(retryLeft / 60)).padStart(2, "0")}:{String(retryLeft % 60).padStart(2, "0")}
        </div>
      </div>
    </>
  );
}

export default LoadingScreen;

// Used by: pages/Screens.jsx.
