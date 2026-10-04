function SkeletonList({ count = 3 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-bg-panel rounded-lg p-3 flex gap-3">
          <div className="skeleton w-2.5 h-2.5 rounded-full mt-1" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="skeleton h-3.5 w-3/5" />
            <div className="skeleton h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonList;

// Shimmer loading placeholder for a vertical list of small cards (dot +
// two text lines each), e.g. a device/item list while data is loading.
// `count` controls how many placeholder rows render (default 3).
// Used by: pages/Assignments.jsx. Not yet used in pages/Playlists.jsx,
// which currently has no loading skeleton at all — a good next reuse.
