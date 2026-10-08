function MobileActionBar({ children, className = "" }) {
  return (
    <div
      className={`md:hidden fixed left-0 right-0 bottom-0 px-4 py-3 bg-bg-primary/95 border-t border-border-muted z-20 ${className}`}
    >
      {children}
    </div>
  );
}

export default MobileActionBar;

// Sticky, full-width action bar pinned to the bottom of the screen below
// `md` (768px) — the "primary action moves to a sticky bottom bar on
// mobile" pattern from the Detail Pane mock, pulled out so it isn't
// DetailPane-only. Pass whatever trigger you need as `children` (a plain
// Button, or an ActionMenu trigger button for a tap-to-open-options case
// like the Content page's upload button).
// Used by: components/DetailPane.jsx, components/UploadSplitButton.jsx,
// pages/Playlists.jsx (left pane's "Create" action).
