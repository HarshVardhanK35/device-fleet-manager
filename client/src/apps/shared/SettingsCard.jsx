// A bordered box with a small blue label ("kicker") on top — groups related
// settings together, e.g. "Location & data", "Display". Used across every
// app's settings panel to keep the same visual grouping style.
function SettingsCard({ kicker, children }) {
  return (
    <div className="flex flex-col gap-3.5 bg-bg-panel border border-border-muted rounded-lg p-3.5">
      <span className="text-[11px] font-semibold tracking-wide uppercase text-accent-blue">
        {kicker}
      </span>
      {children}
    </div>
  );
}

export default SettingsCard;
