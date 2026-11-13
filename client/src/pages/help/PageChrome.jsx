import { Link } from "react-router-dom";
import { ArrowLeft, Moon, Sun } from "lucide-react";

import Logo from "../../components/layout/Logo.jsx";
import { useAuth } from "../../context/useAuth.js";
import { CopyEmail } from "./HelpAnswer.jsx";

// The slim header of the Help and legal pages: logo, a word beside it ("Help", "Terms"...), the theme
// switch, a link back and Sign in (hidden when signed in).
export function PageHeader({ suffix, theme, onToggleTheme }) {
  const { token } = useAuth();
  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  return (
    <header className="hp-header">
      <div className="hp-container hp-header__inner">
        <Link className="hp-brand" to="/">
          <Logo size={28} />
          <span>CastWise</span>
          <span className="hp-brand__suffix">{suffix}</span>
        </Link>
        <nav className="hp-header__nav" aria-label="Account">
          <button type="button" className="hp-icon-btn" aria-label={label} title={label} onClick={onToggleTheme}>
            {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
          <Link className="hp-back" to="/">
            <ArrowLeft size={15} aria-hidden="true" />
            <span className="hp-back__long">Back to CastWise</span>
            <span className="hp-back__short">Back</span>
          </Link>
          {!token && (
            <Link className="hp-signin" to="/login">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

// The slim footer: copyright, the legal pages, Help and the support address.
export function PageFooter() {
  return (
    <footer className="hp-footer">
      <div className="hp-container hp-footer__inner">
        <span className="hp-footer__brand">
          <Logo size={18} />
          &copy; {new Date().getFullYear()} CastWise
        </span>
        <nav className="hp-footer__links" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/help">Help</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/acceptable-use">Acceptable use</Link>
          <Link to="/privacy">Privacy</Link>
          <CopyEmail />
        </nav>
      </div>
    </footer>
  );
}

// Used by: pages/Help.jsx, pages/Legal.jsx.
