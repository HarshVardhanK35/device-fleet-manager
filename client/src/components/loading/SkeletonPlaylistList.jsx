function SkeletonPlaylistList({ count = 4 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-bg-panel border border-border-muted rounded-[10px] p-3 pl-4 flex items-center gap-2.5"
        >
          <div className="skeleton w-8 h-8 rounded-lg flex-none" />
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="skeleton h-3.5 w-3/5 rounded" />
            <div className="skeleton h-3 w-2/5 rounded" />
          </div>
          <div className="skeleton w-8 h-8 rounded-md flex-none" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonPlaylistList;

// Shimmer loading placeholder shaped to match PlaylistRow.jsx (icon square
// + two text lines + "⋮" menu placeholder) — the generic SkeletonList (dot
// + two lines) didn't reflect the real row shape. No checkbox placeholder:
// an empty box here would just be guessing at a selection state nothing
// can act on yet — real checkboxes only matter once there's data and the
// user engages Select all.
// `count` controls how many placeholder rows render (default 4).
// Used by: pages/Playlists.jsx.
