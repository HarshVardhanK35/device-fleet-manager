import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { USE_CASES } from "./landingData.js";

// The "What do you run?" popover (A1 SPEC §5): non-blocking, never opens on
// load, closes on outside click / Esc / Tab / a pick. A pick fires the
// `castwise:usecase` event on document (detail: { value }) for the live demo.
// Keys: Enter / Space / ArrowDown on the button open it; arrows (and left /
// right on the two-column phone layout), Home / End move; Enter / Space picks.
// Used by: pages/Landing.jsx.
function UseCaseChooser() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const optRefs = useRef([]);

  const current = USE_CASES[selected];
  const CurrentIcon = current.icon;

  const close = (returnFocus) => {
    setOpen(false);
    if (returnFocus) btnRef.current?.focus();
  };

  const openList = () => {
    setOpen(true);
    // focus after the popover is no longer inert
    requestAnimationFrame(() => optRefs.current[selected]?.focus({ preventScroll: true }));
  };

  const pick = (i) => {
    setSelected(i);
    close(true);
    document.dispatchEvent(new CustomEvent("castwise:usecase", { detail: { value: USE_CASES[i].value } }));
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const onOptKey = (e, i) => {
    const cols = window.matchMedia("(max-width: 599px)").matches ? 2 : 1;
    const last = USE_CASES.length - 1;
    let next = null;
    if (e.key === "ArrowDown") next = Math.min(i + cols, last);
    else if (e.key === "ArrowUp") next = Math.max(i - cols, 0);
    else if (e.key === "ArrowRight" && cols === 2) next = Math.min(i + 1, last);
    else if (e.key === "ArrowLeft" && cols === 2) next = Math.max(i - 1, 0);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(i);
      return;
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
      return;
    } else if (e.key === "Tab") {
      close(false);
      return;
    }
    if (next !== null) {
      e.preventDefault();
      optRefs.current[next]?.focus();
    }
  };

  return (
    <div className="chooser" ref={rootRef}>
      <button
        ref={btnRef}
        className="chooser-btn"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="chooser-list"
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            openList();
          }
        }}
      >
        <span className="chooser-label">What do you run?</span>
        <span className="chooser-value">
          <CurrentIcon className="ic" aria-hidden="true" />
          <span>{current.value}</span>
        </span>
        <ChevronDown className="ic chooser-caret" aria-hidden="true" />
      </button>

      <div className={`chooser-pop${open ? " is-open" : ""}`} inert={!open}>
        <ul className="chooser-list" id="chooser-list" role="listbox" aria-label="What do you run?">
          {USE_CASES.map((u, i) => {
            const Icon = u.icon;
            return (
              <li
                key={u.value}
                ref={(el) => {
                  optRefs.current[i] = el;
                }}
                className="chooser-opt"
                style={{ "--i": i }}
                role="option"
                tabIndex={-1}
                aria-selected={i === selected}
                onClick={() => pick(i)}
                onKeyDown={(e) => onOptKey(e, i)}
              >
                <Icon className="ic" aria-hidden="true" />
                <span>{u.value}</span>
                <Check className="ic chooser-check" aria-hidden="true" />
              </li>
            );
          })}
        </ul>
        <p className="chooser-note">The demo switches to examples for your kind of place.</p>
      </div>
    </div>
  );
}

export default UseCaseChooser;
