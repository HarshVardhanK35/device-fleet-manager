import { ChevronLeft, ChevronRight } from "lucide-react";

// A small round button on the divider line between a page's left list and its
// detail pane (desktop only): collapses the list so the detail gets the full
// width, and brings it back. Put it inside the left pane, which must be
// `relative` and have the divider as its right border. It stays near the middle
// of the screen while the page scrolls.
function PaneToggle({ collapsed, onToggle }) {
  const label = collapsed ? "Show the list" : "Hide the list";
  return (
    <div data-pane-toggle className="hidden lg:block absolute inset-y-0 -right-3 w-6 z-10 pointer-events-none">
      <button
        type="button"
        onClick={onToggle}
        title={label}
        aria-label={label}
        aria-expanded={!collapsed}
        className="pointer-events-auto sticky top-[45vh] flex w-6 h-6 items-center justify-center rounded-full border border-border-muted bg-bg-panel text-text-muted hover:text-text-primary hover:border-border-hover hover:bg-bg-hover transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
}

export default PaneToggle;

// Used by: pages/Playlists.jsx, pages/Assignments.jsx, components/screens/slots/SlotRail.jsx.
