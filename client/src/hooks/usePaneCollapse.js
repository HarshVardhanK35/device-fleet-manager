import { useState } from "react";

// Added to a left pane while it is collapsed (desktop, lg and up): the pane
// shrinks to a thin strip and everything in it is hidden except the PaneToggle.
export const COLLAPSED_PANE_CLASS = "lg:!w-4 lg:!pr-0 lg:[&>:not([data-pane-toggle])]:hidden";

// Whether a page's left pane (its list) is collapsed on desktop, remembered in
// localStorage per page (`key`, e.g. "playlists"). Below lg the pane is never
// collapsed: those layouts already show the list and the detail one after the other.
//   returns [collapsed, toggle]
export function usePaneCollapse(key) {
  const storageKey = `castwise.pane.${key}.collapsed`;
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  });

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(storageKey, next ? "1" : "0");
    } catch {
      // private mode: the choice just lasts until the page is closed
    }
  }

  return [collapsed, toggle];
}

// Used by: pages/Playlists.jsx, pages/Assignments.jsx, pages/PlayerSlots.jsx
// (with components/layout/PaneToggle.jsx).
