import { useStageCss } from "../../../utils/stageCss.js";

// Three dots that pulse in turn ("waiting").
function PulsingDots() {
  const css = useStageCss();
  return (
    <div style={{ display: "flex", gap: css("clamp(4px,0.9cqmin,44px)") }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: css("clamp(6px,1.2cqmin,60px)"),
            height: css("clamp(6px,1.2cqmin,60px)"),
            borderRadius: "50%",
            background: "var(--color-accent-400)",
            animation: `screens-pulse 1.4s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default PulsingDots;

// Used by: components/screens/stage/CodeScreen.jsx, LoadingScreen.jsx.
