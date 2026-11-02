import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Moon, Sun } from "lucide-react";

import { BrandMark } from "./landingParts.jsx";
import { NAV } from "./landingData.js";

// Sticky glass header: logo, anchor links (the clicked one keeps its
// underline), theme toggle, Sign in / Get started. Below 1024px the links move
// into a menu sheet; Esc closes it, and so does widening past the tablet width.
// Used by: pages/Landing.jsx.
function LandingHeader({ theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onWide = (e) => {
      if (e.matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [menuOpen]);

  const themeLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <header className="site-header">
      <div className="wrap">
        <a className="brand" href="#top" aria-label="CastWise home">
          <BrandMark />
          <span className="brand-name">CastWise</span>
        </a>

        <nav className="nav" aria-label="Page sections">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              aria-current={current === n.href ? "location" : undefined}
              onClick={() => setCurrent(n.href)}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button className="icon-btn" type="button" aria-label={themeLabel} onClick={onToggleTheme}>
            {theme === "dark" ? <Sun className="ic icon-sun" aria-hidden="true" /> : <Moon className="ic icon-moon" aria-hidden="true" />}
          </button>
          <Link className="btn btn-quiet" to="/login">
            Sign in
          </Link>
          <Link className="btn btn-primary btn-sm" to="/register">
            Get started
          </Link>
          <button
            className="icon-btn icon-btn--menu"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="menu-sheet"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Menu className="ic" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="menu-sheet" id="menu-sheet" hidden={!menuOpen}>
        <nav aria-label="Page sections (menu)" onClick={(e) => e.target.closest("a") && setMenuOpen(false)}>
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
          <Link className="menu-signin" to="/login">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default LandingHeader;
