import { useEffect, useState, useSyncExternalStore } from "react";

function subscribe(query) {
  return (onChange) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  };
}

// True while the window matches a CSS media query (live).
export function useMediaQuery(query) {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

// The width of an element, kept up to date as it changes (for example when the
// side navbar opens or collapses). 0 until it has been measured.
export function useElementWidth(ref) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// A page is "compact" on a tablet (md and up) whose usable width is still
// narrow, which is what a 768px tablet with the side navbar open gives. Phones
// have their own layout and are never compact.
// Used by: pages/Content.jsx.
export function useCompactLayout(ref, narrowerThan = 600) {
  const isTabletUp = useMediaQuery("(min-width: 768px)");
  const width = useElementWidth(ref);
  return isTabletUp && width > 0 && width < narrowerThan;
}
