import { forwardRef } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";

const ScrollBox = forwardRef(function ScrollBox(
  { className = "", children, bleed = false },
  ref,
) {
  return (
    <ScrollArea.Root className={`relative flex flex-col flex-1 min-h-0 overflow-hidden ${bleed ? "-mr-3" : ""}`}>
      <ScrollArea.Viewport
        ref={ref}
        className={`w-full h-full [&>div]:!block ${bleed ? "pr-3" : ""} ${className}`}
      >
        {children}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="vertical"
        className="flex select-none touch-none p-0.5 bg-bg-hover w-2.5 rounded-full"
      >
        <ScrollArea.Thumb className="flex-1 bg-text-muted rounded-full relative" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
});

export default ScrollBox;

// Themed scrollbar (wraps Radix ScrollArea) used app-wide in place of the
// native browser scrollbar. Root must stay `flex flex-col` for sizing to
// work, and the Viewport's `[&>div]:!block` override is required — Radix
// injects its own `display:table` wrapper that otherwise collapses grid
// content to near-zero width (a real bug hit and fixed during this build).
// Root also needs `relative` — Radix's Scrollbar is positioned absolute
// against the nearest positioned ancestor; without this, it escapes
// outside Root's own rounded/clipped box instead of sitting inside it
// (only became visible once this was used inside a narrow bordered panel —
// ContentDetailsPanel.jsx).
// `bleed` puts the scrollbar in the 12px just outside the box (the page's own
// padding), so the content keeps the full width and the left and right margins
// stay equal (Content page).
// Forwards `ref` to the Viewport's scrollable DOM node — optional, only
// needed by callers that must read/control scroll position themselves
// (e.g. ScrollToTopButton).
// Used by: pages/Playlists.jsx, components/ContentPickerModal.jsx,
// components/ConfirmDeleteModal.jsx, components/Layout.jsx (page scroll).
