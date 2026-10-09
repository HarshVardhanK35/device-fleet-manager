import { CalendarOff, Play } from "lucide-react";

// `playing` is null (nothing scheduled) or
// { kicker, title, sub, pos, bg } describing the current content.
// `mini` = small rail thumbnail (no play button, no "nothing scheduled"
// text, just the bare visual). `bare` = full-size but without the play
// button overlay (used inside modals where it's a passive mirror, not a
// clickable preview trigger).
function ScreenThumb({ playing, mini = false, bare = false }) {
  if (!playing) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-1.5 bg-[repeating-linear-gradient(135deg,#0d1117_0_8px,#11161d_8px_16px)]">
        <CalendarOff size={mini ? 14 : 22} className="text-border-hover" />
        {!mini && (
          <span className="text-text-muted text-xs">
            Nothing scheduled at this time
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full flex flex-col justify-center gap-1 px-[8%] overflow-hidden"
      style={{ background: playing.bg }}
    >
      {!mini && (
        <>
          <span className="text-accent-amber text-[10px] sm:text-xs font-bold tracking-[0.2em]">
            {playing.kicker}
          </span>
          <span className="text-text-primary text-xl sm:text-3xl font-bold leading-none tracking-tight truncate">
            {playing.title}
          </span>
          <span className="text-text-muted text-xs sm:text-sm">
            {playing.sub}
          </span>
        </>
      )}

      {!mini && !bare && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/55 to-transparent">
          <span className="w-10 h-10 rounded-full bg-bg-primary/70 border border-text-primary/25 flex items-center justify-center">
            <Play size={16} className="text-text-primary ml-0.5" fill="currentColor" />
          </span>
        </div>
      )}

      {!mini && (
        <span className="absolute right-1.5 bottom-1.5 px-1.5 py-0.5 rounded bg-bg-primary/85 text-text-primary text-[10px] font-medium">
          {playing.pos}
        </span>
      )}
    </div>
  );
}

export default ScreenThumb;

// Renders a screen's current content as a thumbnail — three sizes/contexts:
// full interactive preview (default), `mini` (tiny rail thumbnail, just the
// gradient + icon, no text), `bare` (full-size but no play-button overlay,
// for read-only modal contexts). Falls back to a dashed "Nothing scheduled
// at this time" panel when `playing` is null.
// Used by: pages/PlayerSlots.jsx.
