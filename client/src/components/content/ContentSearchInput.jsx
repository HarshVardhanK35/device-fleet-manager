import { useState } from "react";
import { Search } from "lucide-react";

import CancelButton from "../ui/CancelButton.jsx";

function ContentSearchInput({
  value,
  onChange,
  placeholder = "Search content",
  only,
  compact = false,
  alwaysBar = false,
  className = "",
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* desktop: always-visible full bar */}
      {only !== "mobile" && !compact && (
      <div className={`relative ${alwaysBar ? "block" : "hidden md:block"} flex-1 max-w-md ${className}`}>
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full bg-bg-panel border border-border-muted rounded-lg pl-9 ${alwaysBar ? "pr-9" : "pr-3"} h-9 text-sm text-text-primary outline-none focus-visible:border-accent-blue`}
        />
        {alwaysBar && value && (
          <CancelButton
            size="sm"
            title="Clear search"
            onClick={() => onChange({ target: { value: "" } })}
            className="absolute right-1 top-1/2 -translate-y-1/2"
          />
        )}
      </div>
      )}

      {/* mobile: icon that expands in place into a full search bar */}
      {!alwaysBar && (only !== "desktop" || compact) && (
      <div
        className={`relative ${compact ? "" : "md:hidden"} overflow-hidden transition-all duration-300 ease-out flex-shrink-0 ${
          mobileOpen ? "w-full" : "w-9"
        }`}
      >
        {!mobileOpen ? (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Search content"
            className="w-9 h-9 rounded-lg border border-border-muted flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <Search size={16} />
          </button>
        ) : (
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              autoFocus
              value={value}
              onChange={onChange}
              onBlur={() => !value && setMobileOpen(false)}
              placeholder={placeholder}
              autoComplete="off"
              className="w-full bg-bg-panel border border-border-muted rounded-lg pl-9 pr-9 h-9 text-sm text-text-primary outline-none focus-visible:border-accent-blue"
            />
            <CancelButton
              size="sm"
              title="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange({ target: { value: "" } });
                setMobileOpen(false);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2"
            />
          </div>
        )}
      </div>
      )}
    </>
  );
}

export default ContentSearchInput;

// `compact` forces the icon-that-expands form at any width (a narrow tablet).
// `alwaysBar` keeps the full bar at every width (no icon on phones) and shows a
// clear (x) button once something is typed (the Users page); `className` adjusts the bar's own size.
// Search input with responsive behavior: a normal full-width bar at `md`+,
// collapsing to a 36px icon below `md` that expands in place (width
// transition) into a small bar on click, closing again on blur if empty or
// via its own clear button. `only` ("desktop" | "mobile") renders just one
// of the two — Content puts the desktop bar in the title row and the mobile
// icon in the toolbar row. Manages its own expand/collapse state —
// `value`/`onChange` behave like a plain controlled <input>.
// Used by: pages/Content.jsx.
