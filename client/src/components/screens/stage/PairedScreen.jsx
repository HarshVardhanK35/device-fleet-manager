import { Check } from "lucide-react";

// "Paired as <name>", shown for a moment after the code is entered.
function PairedScreen({ screenName }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "clamp(10px,2.6cqmin,130px)" }}>
      <div
        style={{
          width: "clamp(56px,15cqmin,780px)",
          aspectRatio: 1,
          borderRadius: "50%",
          border: "clamp(2px,0.5cqmin,26px) solid var(--color-accent-400)",
          background: "color-mix(in srgb, var(--color-accent) 18%, transparent)",
          boxShadow: "0 0 6cqmin color-mix(in srgb, var(--color-accent) 50%, transparent)",
          display: "grid",
          placeItems: "center",
          animation: "screens-pop 0.6s cubic-bezier(.2,.8,.3,1) both",
        }}
      >
        <Check style={{ width: "48%", height: "48%", color: "var(--color-accent-100)" }} strokeWidth={2.5} />
      </div>
      <div style={{ fontSize: "clamp(16px,3.4cqmin,170px)", color: "var(--color-accent-200)", marginTop: "clamp(6px,1.6cqmin,80px)" }}>
        Paired as
      </div>
      <div style={{ fontSize: "clamp(32px,10cqmin,520px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>
        {screenName}
      </div>
    </div>
  );
}

export default PairedScreen;

// Used by: pages/Screens.jsx.
