import { useState } from "react";
import { Search } from "lucide-react";

import CancelButton from "./CancelButton.jsx";

function ContentSearchInput({ value, onChange, placeholder = "Search content" }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* desktop: always-visible full bar */}
      <div className="relative hidden md:block flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-bg-panel border border-border-muted rounded-lg pl-9 pr-3 h-9 text-sm text-text-primary outline-none focus-visible:border-accent-blue"
        />
      </div>

      {/* mobile: icon that expands in place into a full search bar */}
      <div
        className={`relative md:hidden overflow-hidden transition-all duration-300 ease-out flex-shrink-0 ${
          mobileOpen ? "w-40" : "w-9"
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
    </>
  );
}

export default ContentSearchInput;

// Search input with responsive behavior: a normal full-width bar at `md`+,
// collapsing to a 36px icon below `md` that expands in place (width
// transition) into a small bar on click, closing again on blur if empty or
// via its own clear button. Manages its own expand/collapse state —
// `value`/`onChange` behave like a plain controlled <input>.
// Used by: pages/Content.jsx.
