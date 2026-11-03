function SkeletonPlayerSlots({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 p-3 rounded-lg border border-border-muted"
        >
          <div className="skeleton w-14 aspect-video rounded flex-none" />
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="skeleton h-2.5 w-10 rounded" />
            <div className="skeleton h-3.5 w-3/5 rounded" />
            <div className="skeleton h-3 w-2/5 rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

export default SkeletonPlayerSlots;

// Shimmer loading placeholder shaped to match PlayerSlots.jsx's slot rail
// rows (thumbnail box + slot label/name/status lines). Renders bare rows
// (no own wrapping flex-col div) so it drops straight into the rail's
// existing `flex flex-col gap-2` container alongside the real slot buttons
// it stands in for. `count` controls how many placeholder rows (default 3,
// matching MAX_SCREENS).
// Used by: pages/PlayerSlots.jsx.
