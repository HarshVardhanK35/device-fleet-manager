function SelectableRow({ as: As = "div", onClick, disabled, className = "", children, ...props }) {
  return (
    <As
      type={As === "button" ? "button" : undefined}
      onClick={onClick}
      disabled={As === "button" ? disabled : undefined}
      className={`cursor-pointer text-left transition-colors transition-transform duration-100 active:scale-[0.99] ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

export default SelectableRow;

// Shared interactive-card wrapper for a left-pane "selectable entity" row
// (a playlist, a device, a screen slot) — owns only the universal bits:
// polymorphic tag (`as="div"` default, or `"button"`), the click handler,
// and the press-down `active:scale-[0.99]` animation. Everything visual
// (border/background color per selected state, padding, radius, layout of
// the row's own content) stays fully caller-controlled via `className` and
// `children` — each page keeps its exact current look; this just stops the
// same interaction classes from being retyped in three places, and gives
// every caller the same press feedback for free.
// Used by: components/PlaylistRow.jsx, pages/Assignments.jsx,
// pages/PlayerSlots.jsx.
