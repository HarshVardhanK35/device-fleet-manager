import { getTypeMeta } from "../utils/contentTypeMeta.js";
import { formatDuration } from "../utils/formatDuration.js";

function ContentTile({
  item,
  className = "",
  children,
  slotIndex,
  slotIndexActive = false,
  size = "lg",
  durationPosition = "bottom-right",
  coloredType = false,
  footerActions,
  onClick,
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
            src={item.thumbnailUrl || item.mediaUrl}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-contain"
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

        {item.durationInMillis && (
          <span
            className={`absolute ${durationPosition === "top-right" ? "right-1.5 top-1.5" : "right-1.5 bottom-1.5"} bg-black/78 text-white text-[10.5px] font-semibold px-1.5 py-0.5 rounded-[5px] leading-[15px] min-h-[15px]`}
          >
            {formatDuration(item.durationInMillis)}
          </span>
        )}

        {children}
      </div>

      <div className="relative flex flex-col gap-1.5 px-2.5 pt-2 pb-2.5">
        {footerActions && (
          <div className="absolute top-1 right-1.5">{footerActions}</div>
        )}
        <p
          className={`font-bold ${textSize} leading-[1.35] ${footerActions ? "pr-6" : ""} text-text-primary whitespace-nowrap overflow-hidden text-ellipsis`}
        >
          {item.name}
        </p>
        <span
          className={`inline-flex items-center justify-center w-fit text-[10px] font-bold px-[6px] py-[2px] rounded-[5px] ${
            coloredType
              ? `${meta.textClass} ${meta.bgClass}`
              : "text-[rgb(214,220,227)] bg-[rgb(39,45,55)]"
          }`}
        >
          {item.type.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default ContentTile;

// The reusable content-item tile: thumbnail/app placeholder, duration
// badge, name, and type badge. `size` is "lg" (218px, default), "sm"
// (140px), or "fluid" (fills parent width — used in grids/modals).
// `slotIndex` (optional) renders a position-number badge top-left on the
// thumbnail (e.g. "3"), for playlist-slot context — pair with a
// top-right-positioned `children` overlay (checkbox/remove button) so they
// don't collide. `slotIndexActive` turns that badge blue (e.g. while the
// tile is checked for bulk selection). `footerActions` (optional) renders a node (e.g. an
// ActionMenu) pinned top-right of the name/type-badge footer, for
// per-item actions. `onClick` (optional) fires for a click anywhere on
// the tile (thumbnail or footer).
// Used by: pages/Content.jsx (via SelectableContentTile), and
// pages/Playlists.jsx indirectly via components/ContentPickerModal.jsx,
// PlaylistSlotTile.jsx, and RemovableContentTile.jsx.
