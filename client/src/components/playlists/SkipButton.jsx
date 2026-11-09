import { Play, SkipForward } from "lucide-react";

// "Skip" / "Unskip" for the selected playlist items: a skipped item stays in
// the playlist but is not played. The label collapses to the icon when the toolbar it
// sits in is narrow (a container query, not the window: an expanded side navbar narrows
// it too), so the filter and Add buttons stay on the same row. The icon says which
// one it is: skip (forward) while the selected items play, play once they are all
// skipped.
function SkipButton({ disabled, unskip, busy, onClick }) {
  const label = unskip ? "Unskip" : "Skip";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      aria-label={label}
      title={unskip ? "Play the selected items again" : "Keep the selected items in the playlist but don't play them"}
      className="inline-flex items-center justify-center gap-1.5 h-9 w-9 @2xl:w-auto px-0 @2xl:px-3 rounded-lg border border-accent-amber/40 text-accent-amber text-sm font-medium hover:bg-accent-amber/10 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
    >
      {unskip ? <Play size={16} /> : <SkipForward size={16} />}
      <span className="hidden @2xl:inline">{label}</span>
    </button>
  );
}

export default SkipButton;

// Used by: pages/Playlists.jsx (passed to ContentToolbar's `beforeAction`).
