import { Pencil } from "lucide-react";

import { getTypeMeta } from "../utils/contentTypeMeta.js";
import { formatDuration } from "../utils/formatDuration.js";
import { getOptimizedThumbnail } from "../utils/cloudinaryTransform.js";

function ContentTile({
  item,
  className = "",
  children,
  slotIndex,
  slotIndexActive = false,
  size = "lg",
  durationPosition = "bottom-right",
  showDuration = true,
  coloredType = false,
  footerActions,
  footerBar,
  onClick,
  onEditClick,
}) {
  const width =
    size === "sm" ? "w-[140px]" : size === "fluid" ? "w-full" : "w-[218px]";
  const textSize = size === "sm" ? "text-[0.6rem]" : "text-[0.7rem]";
  const meta = getTypeMeta(item.type);

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer ${width} rounded-[10px] overflow-hidden bg-bg-panel border border-border-muted transition-colors duration-150 hover:bg-[#1c2129] hover:border-border-hover ${className}`}
    >
      <div className="relative aspect-video bg-[#201e1e] flex items-center justify-center">
        {item.type === "app" ? (
          <span className="text-text-muted text-sm">App</span>
        ) : (
          <img
            src={getOptimizedThumbnail(item.thumbnailUrl || item.mediaUrl, 400)}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-contain"
            loading="lazy"
          />
        )}

        {slotIndex !== undefined && (
          <span
            className={`absolute left-1.5 top-1.5 h-[22px] min-w-[26px] px-1.5 rounded-md border flex items-center justify-center text-[12px] font-bold tabular-nums transition-colors ${
              slotIndexActive
                ? "bg-accent-blue border-accent-blue text-white"
                : "bg-black/78 border-border-muted text-text-primary"
            }`}
          >
            #{slotIndex + 1}
          </span>
        )}

        {showDuration && item.durationInMillis && (
          <span
            className={`absolute ${durationPosition === "top-right" ? "right-1.5 top-1.5" : "right-1.5 bottom-1.5"} bg-black/78 text-white text-[10.5px] font-semibold px-1.5 py-0.5 rounded-[5px] leading-[15px] min-h-[15px]`}
          >
            {formatDuration(item.durationInMillis)}
          </span>
        )}

        {onEditClick && (
          <button
            type="button"
            aria-label="Edit settings"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(item);
            }}
            className="absolute right-1.5 top-1.5 w-[26px] h-[26px] rounded-md flex items-center justify-center bg-black/70 border border-white/80 text-white opacity-0 group-hover:opacity-100 hover:bg-black/85 transition-opacity"
          >
            <Pencil size={13} />
          </button>
        )}

        {children}
      </div>

      <div className="flex items-center gap-2 px-2.5 py-2.5">
        <p
          title={item.name}
          className={`flex-1 min-w-0 font-bold ${textSize} leading-[1.35] text-text-primary whitespace-nowrap overflow-hidden text-ellipsis`}
        >
          {item.name}
        </p>
        <span
          className={`flex-none inline-flex items-center justify-center text-[10px] font-bold px-[6px] py-[2px] rounded-[5px] ${
            coloredType
              ? `${meta.textClass} ${meta.bgClass}`
              : "text-[rgb(214,220,227)] bg-[rgb(39,45,55)]"
          }`}
        >
          {item.type.toUpperCase()}
        </span>
        {footerActions && <div className="flex-none">{footerActions}</div>}
      </div>
      {footerBar}
    </div>
  );
}

export default ContentTile;

// The reusable content-item tile: thumbnail/app placeholder, duration
// badge, and a footer row with the name (left, tooltip when truncated) and
// the type badge (right). `size` is "lg" (218px, default), "sm"
// (140px), or "fluid" (fills parent width — used in grids/modals).
// `slotIndex` (optional) renders a position-number badge top-left on the
// thumbnail (e.g. "3"), for playlist-slot context — pair with a
// top-right-positioned `children` overlay (checkbox/remove button) so they
// don't collide. `slotIndexActive` turns that badge blue (e.g. while the
// tile is checked for bulk selection). `footerActions` (optional) renders a node (e.g. an
// ActionMenu) pinned top-right of the name/type-badge footer, for
// per-item actions. `footerBar` (optional) renders a full-width node under
// the footer row (e.g. PlaylistSlotTile's mobile move buttons). `onClick` (optional) fires for a click anywhere on
// the tile (thumbnail or footer).
// Used by: pages/Content.jsx (via SelectableContentTile), and
// pages/Playlists.jsx indirectly via components/ContentPickerModal.jsx,
// PlaylistSlotTile.jsx, and RemovableContentTile.jsx.
