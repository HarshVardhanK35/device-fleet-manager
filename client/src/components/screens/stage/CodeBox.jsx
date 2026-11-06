// One character of the pairing code, in its own box.
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

export default CodeBox;

// Used by: components/screens/stage/CodeScreen.jsx.
