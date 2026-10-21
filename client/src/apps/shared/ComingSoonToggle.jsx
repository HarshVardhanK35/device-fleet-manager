import ToggleSwitch from "./ToggleSwitch.jsx";

// A disabled toggle row with a "Coming soon" badge — for a setting that's
// shown (so the layout matches what it'll look like once built) but isn't
// wired to anything yet. Was hand-copied identically into every app's
// Display card for the "Theme (iframe only)" row; now one shared piece.
function ComingSoonToggle({ label = "Theme (iframe only)" }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted/70">{label}</span>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-hover text-text-muted">
        Coming soon
      </span>
      <div className="flex-1" />
      <ToggleSwitch checked={false} onChange={() => {}} disabled />
    </div>
  );
}

export default ComingSoonToggle;
