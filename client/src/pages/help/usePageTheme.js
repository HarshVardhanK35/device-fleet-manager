import { useEffect } from "react";

import { useLandingTheme } from "../landing/useLandingTheme.js";

const BODY_BG = { dark: "#0d1117", light: "#ffffff" };

// The same saved choice as the landing page's switch (else the system's), and the page background
// under the overscroll follows it; undone on leave. Returns [theme, toggleTheme].
// Used by: pages/Help.jsx, pages/Legal.jsx.
export function usePageTheme() {
  const [theme, toggleTheme] = useLandingTheme();
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = BODY_BG[theme];
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, [theme]);
  return [theme, toggleTheme];
}
