function SkeletonGrid({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-[10px] overflow-hidden bg-bg-panel border border-border-muted"
        >
          <div className="skeleton aspect-video" />
          <div className="flex flex-col gap-2 px-2.5 pt-2 pb-2.5">
            <div className="skeleton h-3.5 w-4/5 rounded" />
            <div className="skeleton h-3 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonGrid;

// Shimmer loading placeholder for a ContentTile grid: `count` (default 10)
// tile-shaped cards (16:9 thumbnail + two text lines), same responsive
// column breakpoints as the real grid so the layout doesn't jump once data
// loads.
// Used by: pages/Content.jsx, pages/Playlists.jsx.
