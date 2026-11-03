function StatTile({ label, icon: Icon, value, valueClassName = "", sub, dot, className = "" }) {
  return (
    <div
      className={`bg-bg-panel border border-border-muted rounded-xl p-4 flex flex-col gap-2.5 ${className}`}
    >
      <div className="flex items-center justify-between text-text-muted text-[13px] font-medium">
        {label}
        {Icon && <Icon size={16} />}
        {dot && (
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: dot, boxShadow: `0 0 0 3px ${dot}33` }}
          />
        )}
      </div>
      <div className={`text-[28px] font-semibold leading-none ${valueClassName}`}>
        {value}
      </div>
      <div className="text-text-muted text-xs">{sub}</div>
    </div>
  );
}

export default StatTile;

// A single KPI stat card for the Dashboard's summary row: label + icon (or
// a status dot, e.g. green/red) on top, a large value, and a muted
// sub-line. `valueClassName` colors the number (e.g. green for Online,
// red for Offline); `dot` takes a hex color to render a glow dot instead
// of an icon.
// Used by: pages/Dashboard.jsx.
