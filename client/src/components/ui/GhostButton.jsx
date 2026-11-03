const SIZES = {
  sm: "h-8 px-3 text-xs font-medium",
  compact: "h-[34px] px-3.5 text-sm font-medium",
  md: "h-9 px-3 text-sm font-medium",
  lg: "h-10 px-4 text-sm font-semibold",
};

function GhostButton({ as: As = "button", size = "md", className = "", children, ...props }) {
  return (
    <As
      type={As === "button" ? "button" : undefined}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-muted text-text-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary transition-colors ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

export default GhostButton;

// Shared neutral/secondary button — outline border, no fill until hover,
// matching ContentPickerModal.jsx's "Cancel" button (the pattern Harsha
// asked to standardize on, 2026-10-09). `as` lets it render as a Radix
// `Dialog.Close` (modals) or a plain `button` (default). `size` covers the
// handful of heights this app actually uses — add a new key rather than
// passing raw height/padding via `className`.
// Used by: pages/PlayerSlots.jsx, components/TakeOverModal.jsx,
// components/RemoveConfirmModal.jsx, components/PlayerStandinModal.jsx.
