import { ChevronLeft } from "lucide-react";

function MobileBackButton({ onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`lg:hidden inline-flex items-center gap-1.5 bg-bg-panel border border-border-muted hover:border-border-hover hover:bg-bg-hover text-text-muted hover:text-text-primary text-sm rounded-lg px-3 py-1.5 transition-colors ${className}`}
    >
      <ChevronLeft size={16} />
      {children}
    </button>
  );
}

export default MobileBackButton;

// "< All devices" / "< Playlists" mobile-only back-to-list button — was
// duplicated near-identically in Assignments.jsx and Playlists.jsx. Pass
// `className` for the one real layout difference between call sites (e.g.
// Assignments needs `mb-3`, Playlists needs `self-start`).
// Used by: pages/Assignments.jsx, pages/Playlists.jsx.
