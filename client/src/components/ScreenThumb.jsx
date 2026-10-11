import { CalendarOff, Play } from "lucide-react";
import { getTypeMeta } from "../utils/contentTypeMeta.js";

// `playing` is null (nothing scheduled) or
// { type, name, mediaUrl, thumbnailUrl, pos } — the first content item of
// the screen's currently-active assignment. `mini` = small rail thumbnail
// (no badges/overlay, just the bare visual). `bare` = full-size but
// without the play button overlay (used inside modals where it's a
// passive mirror, not a clickable preview trigger).
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

  const meta = getTypeMeta(playing.type);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#201e1e]">
      {playing.type === "app" ? (
        <div className="w-full h-full flex items-center justify-center">
          {!mini && <span className="text-text-muted text-sm">App</span>}
        </div>
      ) : (
        <img
          src={playing.thumbnailUrl || playing.mediaUrl}
          alt={playing.name}
          className="absolute inset-0 w-full h-full object-contain"
        />
      )}

      {!mini && (
        <span
          className={`absolute left-1.5 top-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] ${meta.textClass} ${meta.bgClass}`}
        >
          {meta.label}
        </span>
      )}

      {!mini && !bare && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/55 to-transparent">
          <span className="w-10 h-10 rounded-full bg-bg-primary/70 border border-text-primary/25 flex items-center justify-center">
            <Play size={16} className="text-text-primary ml-0.5" fill="currentColor" />
          </span>
        </div>
      )}

      {!mini && playing.pos && (
        <span className="absolute right-1.5 bottom-1.5 px-1.5 py-0.5 rounded bg-bg-primary/85 text-text-primary text-[10px] font-medium">
          {playing.pos}
        </span>
      )}
    </div>
  );
}

export default ScreenThumb;

// Renders a screen's current content as a thumbnail — three sizes/contexts:
// full interactive preview (default), `mini` (tiny rail thumbnail, just
// the image), `bare` (full-size but no play-button overlay, for read-only
// modal contexts). Falls back to a dashed "Nothing scheduled at this
// time" panel when `playing` is null. Shows the content item's own
// thumbnail/mediaUrl (same convention as components/ContentTile.jsx) —
// not a live render of what's actually on the physical screen right now;
// see pages/PlayerSlots.jsx for how `playing` gets computed.
// Used by: pages/PlayerSlots.jsx.
