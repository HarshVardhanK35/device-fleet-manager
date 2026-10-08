import { forwardRef } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";

const ScrollBox = forwardRef(function ScrollBox(
  { className = "", children },
  ref,
) {
  return (
    <ScrollArea.Root className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <ScrollArea.Viewport
        ref={ref}
        className={`w-full h-full [&>div]:!block ${className}`}
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
// Forwards `ref` to the Viewport's scrollable DOM node — optional, only
// needed by callers that must read/control scroll position themselves
// (e.g. ScrollToTopButton).
// Used by: pages/Playlists.jsx, components/ContentPickerModal.jsx,
// components/ConfirmDeleteModal.jsx, components/Layout.jsx (page scroll).
