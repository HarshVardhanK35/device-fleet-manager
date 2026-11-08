import { SkipForward } from "lucide-react";

import AppThumb from "../ui/AppThumb.jsx";
import { appTypeOf } from "../../utils/appType.js";
import { formatDuration } from "../../utils/formatDuration.js";
import { pluralizeCount } from "../../utils/pluralize.js";

const MAX_TILES = 8;

// Counts for a playlist: the items, which of them are skipped, how many play
// and how long one round takes (skipped items are left out of both).
function summarize(playlist) {
  const items = playlist?.contentItems ?? [];
  const skipped = new Set((playlist?.skippedItems ?? []).map(String));
  const playing = items.filter((item) => !skipped.has(String(item._id)));
  const totalMs = playing.reduce((sum, item) => sum + (item.durationInMillis || 0), 0);
  return { items, skipped, playing, totalMs, skippedCount: items.length - playing.length };
}

// A single line for a card too narrow for the full preview (a laptop with the
// side navbar and the list open): "3 items · 02:15 per round · 1 skipped".
// Shown on desktop only, and only while the full preview is hidden.
export function AssignmentPlaylistLine({ playlist }) {
  const { items, playing, totalMs, skippedCount } = summarize(playlist);
  if (items.length === 0) return null;

  return (
    <p className="hidden lg:block @2xl:hidden text-text-muted text-xs mt-2">
      {pluralizeCount(playing.length, "item")}
      {totalMs > 0 && ` · ${formatDuration(totalMs)} per round`}
      {skippedCount > 0 && <span className="text-accent-amber"> · {skippedCount} skipped</span>}
    </p>
  );
}

// What is in the assignment's playlist: how many items play, how long one round
// takes, and a strip of small thumbnails (skipped items are dimmed and left out
// of the count and the time). Fills the right side of an AssignmentCard, but
// only when the card itself is wide enough (container query on the card, 48rem):
// a laptop with the navbar and list open gets AssignmentPlaylistLine instead,
// phone and tablet get neither.
//   playlist  the assignment's populated playlist ({ contentItems, skippedItems })
function AssignmentPlaylistPreview({ playlist }) {
  const { items, skipped, playing, totalMs, skippedCount } = summarize(playlist);
  if (items.length === 0) return null;

  const shown = items.slice(0, MAX_TILES);
  const more = items.length - shown.length;

  return (
    <div className="hidden lg:@2xl:flex flex-col gap-2.5 min-w-0 @2xl:max-w-[44%] @2xl:pl-6 @2xl:border-l @2xl:border-border-muted">
      <div>
        <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide">Playlist</p>
        <p className="text-text-primary font-bold" title="Time one round of the playlist takes">
          {pluralizeCount(playing.length, "item")}
          {totalMs > 0 && <span className="text-text-muted font-medium"> · {formatDuration(totalMs)}</span>}
        </p>
        {skippedCount > 0 && (
          <p className="text-accent-amber text-xs mt-0.5">
            {pluralizeCount(skippedCount, "item")} skipped
          </p>
        )}
      </div>

      <ul className="m-0 p-0 list-none flex flex-wrap gap-2">
        {shown.map((item, i) => {
          const isSkipped = skipped.has(String(item._id));
          return (
            <li
              key={`${item._id}-${i}`}
              title={item.name}
              className="relative w-20 aspect-video rounded-md overflow-hidden border border-border-muted bg-[#201e1e] flex items-center justify-center"
            >
              {item.type === "app" ? (
                <AppThumb appType={appTypeOf(item)} iconClassName="w-[30%]" />
              ) : (
                <img
                  src={item.thumbnailUrl || item.mediaUrl}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
              <span className="absolute left-1 top-1 min-w-[16px] h-4 px-1 rounded bg-black/75 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                {i + 1}
              </span>
              {isSkipped && (
                <span className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <SkipForward size={14} className="text-accent-amber" aria-label="Skipped" />
                </span>
              )}
            </li>
          );
        })}
        {more > 0 && (
          <li className="w-20 aspect-video rounded-md border border-dashed border-border-muted flex items-center justify-center text-text-muted text-xs font-semibold">
            +{more}
          </li>
        )}
      </ul>
    </div>
  );
}

export default AssignmentPlaylistPreview;

// Used by: components/assignments/AssignmentCard.jsx.
