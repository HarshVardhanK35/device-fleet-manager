function SkeletonPanel({ rows = 3 }) {
  return (
    <div className="bg-bg-panel border border-bg-hover rounded-lg p-6 flex flex-col gap-5">
      <div className="flex justify-between gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <div className="skeleton h-5 w-2/5" />
          <div className="skeleton h-3 w-1/3" />
        </div>
        <div className="skeleton w-24 h-9 rounded-lg" />
      </div>
      {Array.from({ length: rows }, (_, k) => (
        <div key={k} className="skeleton h-28 rounded-lg" />
      ))}
    </div>
  );
}

export default SkeletonPanel;

// Shimmer loading placeholder for a detail panel: a header block (title +
// subtitle + action-button-shaped skeleton) followed by `rows` (default 3)
// full-width card-shaped placeholders.
// Used by: pages/Assignments.jsx.
