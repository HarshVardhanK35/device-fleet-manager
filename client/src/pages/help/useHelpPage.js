import { useEffect, useMemo, useRef, useState } from "react";

import { HELP_CONTENT, answerText } from "./helpContent.js";

const COPIED_MS = 1600; // how long "Link copied" shows
const SPY_LOCK_MS = 900; // scroll-spy pauses this long after a section jump
const SPY_LINE = 160; // px from the top of the window that marks the current section
const PHONE_MAX = 599; // the phone breakpoint of help.css

const FIRST_SECTION = HELP_CONTENT[0].id;
const SECTION_OF = {};
const SEARCH_TEXT = {};
HELP_CONTENT.forEach((section) =>
  section.questions.forEach((question) => {
    SECTION_OF[question.id] = section.id;
    SEARCH_TEXT[question.id] = `${section.title} ${question.q} ${answerText(question)}`.toLowerCase();
  }),
);

// The question named by the page's #link, if there is one.
function idFromHash() {
  try {
    const id = decodeURIComponent(window.location.hash.slice(1));
    return SECTION_OF[id] ? id : null;
  } catch {
    return null;
  }
}

const isPhone = () => window.innerWidth <= PHONE_MAX;
const scrollToTop = (el, offset, smooth) =>
  window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - offset, behavior: smooth ? "smooth" : "auto" });

// Everything the Help page does: search (every word must appear in a question, its section or its
// answer), the accordion (one answer open at a time), the section list with scroll-spy, #links to
// a question and "Copy link". The page (pages/Help.jsx) only draws it.
export function useHelpPage() {
  const [startId] = useState(idFromHash);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(startId);
  const [linkedId, setLinkedId] = useState(startId);
  const [active, setActive] = useState(startId ? SECTION_OF[startId] : FIRST_SECTION);
  const [copiedId, setCopiedId] = useState(null);
  const spyLockUntil = useRef(0);
  const copyTimer = useRef(0);

  // Search: the questions that match, and how many.
  const { shown, total, words } = useMemo(() => {
    const parts = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const set = new Set(Object.keys(SEARCH_TEXT).filter((id) => parts.every((w) => SEARCH_TEXT[id].includes(w))));
    return { shown: set, total: set.size, words: parts };
  }, [query]);

  // On arrival: to that question when opened with a #link, otherwise to the top (arriving from
  // the landing page's footer would keep its scroll position, which is the bottom).
  useEffect(() => {
    const el = startId && document.getElementById(startId);
    if (el) scrollToTop(el, isPhone() ? 72 : 24, false);
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [startId]);

  // A #link followed while the page is open.
  useEffect(() => {
    function onHash() {
      const id = idFromHash();
      if (!id) return;
      setQuery("");
      setOpenId(id);
      setLinkedId(id);
      setActive(SECTION_OF[id]);
      // wait a frame: a search that was hiding it has just been cleared
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) scrollToTop(el, isPhone() ? 72 : 24, false);
      });
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Scroll-spy: the current section is the last one whose top has passed the line.
  useEffect(() => {
    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (Date.now() < spyLockUntil.current) return;
        let current = null;
        document.querySelectorAll("[data-hp-sec]").forEach((el) => {
          if (el.getBoundingClientRect().top < SPY_LINE) current = el.dataset.hpSec;
        });
        if (current) setActive(current);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  function changeQuery(value) {
    setQuery(value);
    setOpenId(null);
    setLinkedId(null);
  }

  function toggle(id) {
    const next = openId === id ? null : id;
    setOpenId(next);
    setLinkedId(null);
    if (next) setActive(SECTION_OF[next]);
  }

  function goTo(sectionId) {
    const el = document.querySelector(`[data-hp-sec="${sectionId}"]`);
    if (!el) return;
    spyLockUntil.current = Date.now() + SPY_LOCK_MS;
    setActive(sectionId);
    scrollToTop(el, isPhone() ? 72 : 16, true);
  }

  function copyLink(id) {
    const url = `${window.location.origin}/help#${id}`;
    try {
      navigator.clipboard?.writeText(url);
    } catch {
      /* the tooltip still shows; the link can be copied from the address bar */
    }
    setCopiedId(id);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopiedId(null), COPIED_MS);
  }

  return { query, words, shown, total, openId, linkedId, active, copiedId, changeQuery, toggle, goTo, copyLink };
}

// Used by: pages/Help.jsx.
