import { useEffect } from "react";

// Layout fires this event when the tab of the page you are on is tapped on a phone. A page with a
// scroll area of its own (the Media grid) scrolls itself to the top; a page with a list and a
// detail step (Playlists, Publish, Player) goes back to its list.
export const SCROLL_TOP_EVENT = "castwise:scroll-top";

// For a list / detail page: tapping its own tab goes back to the list.
//   setMobileView  the page's setter for "list" | "detail"
export function useTabBackToList(setMobileView) {
  useEffect(() => {
    const toList = () => setMobileView("list");
    window.addEventListener(SCROLL_TOP_EVENT, toList);
    return () => window.removeEventListener(SCROLL_TOP_EVENT, toList);
  }, [setMobileView]);
}

// Used by: components/layout/Layout.jsx, pages/Content.jsx, pages/Assignments.jsx,
// hooks/usePlaylistsPage.js, hooks/useScreenSlots.js.
