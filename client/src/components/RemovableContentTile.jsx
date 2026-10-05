import { X } from "lucide-react";

import ContentTile from "./ContentTile.jsx";

function RemovableContentTile({ item, slotIndex, onRemove }) {
  return (
    <ContentTile item={item} size="fluid" slotIndex={slotIndex} coloredType>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
        title="Remove from playlist"
        className="absolute right-1.5 top-1.5 z-10 w-[26px] h-[26px] rounded-full border border-border-muted bg-black/84 text-text-primary flex items-center justify-center transition-colors hover:bg-accent-red hover:border-accent-red hover:text-bg-primary"
      >
        <X size={12} strokeWidth={3} />
      </button>
    </ContentTile>
  );
}

export default RemovableContentTile;

// A ContentTile with a position badge (top-left) and an always-visible
// round remove (X) button (top-right) — for grids that show *existing*
// membership you can take items out of, e.g. the Edit Playlist modal's
// "Content in this playlist" section. Not for bulk multi-select (see
// SelectableContentTile / SelectCheckbox for that).
// Used by: pages/Playlists.jsx (Edit Playlist modal).
