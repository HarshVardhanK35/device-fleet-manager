import { useEffect, useRef, useState } from "react";

const SPY_LINE = 160; // px from the top of the window that marks the current section
const SPY_LOCK_MS = 900; // scroll-spy pauses this long after a jump, so the clicked entry stays highlighted

// The "On this page" list of a legal page: which section is being read (the last one whose top has
// passed the line) and a jump to a section. The sections are elements with data-legal-sec="<index>".
// Used by: pages/Legal.jsx.
export function useLegalSections(doc) {
  const [active, setActive] = useState(0);
  const lockUntil = useRef(0);

  useEffect(() => {
    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (Date.now() < lockUntil.current) return;
        let current = 0;
        document.querySelectorAll("[data-legal-sec]").forEach((el) => {
          if (el.getBoundingClientRect().top < SPY_LINE) current = Number(el.dataset.legalSec);
        });
        setActive(current);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [doc]);

  function goTo(index) {
    const el = document.querySelector(`[data-legal-sec="${index}"]`);
    if (!el) return;
    lockUntil.current = Date.now() + SPY_LOCK_MS;
    setActive(index);
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 16, behavior: "smooth" });
  }

  return { active, goTo };
}
