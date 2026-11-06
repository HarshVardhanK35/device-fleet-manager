import { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

import { BrandMark } from "./landingParts.jsx";

const ICON = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true };

// Small brand marks for the Connect links.
const LinkedInIcon = () => (
  <svg {...ICON}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const GitHubIcon = () => (
  <svg {...ICON}>
    <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57v-2c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .3" />
  </svg>
);

const XIcon = () => (
  <svg {...ICON}>
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
  </svg>
);

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/cast-wise", Icon: LinkedInIcon },
  { label: "GitHub", href: "https://github.com/cast-wise", Icon: GitHubIcon },
  { label: "Twitter", href: "https://x.com/castwisehq", Icon: XIcon },
];

// Four-column footer: brand, Product, Support, Connect. Stacks on a phone.
// Used by: pages/Landing.jsx.
function LandingFooter() {
  const [note, setNote] = useState(null); // "feedback" | "email" | null
  const toggle = (key) => setNote((n) => (n === key ? null : key));
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <a className="brand" href="#top" aria-label="CastWise home">
            <BrandMark size={24} />
            <span className="brand-name">CastWise</span>
          </a>
          <p>Free digital signage for any screen.</p>
          <small>&copy; {new Date().getFullYear()} CastWise</small>
        </div>

        <nav className="footer-col" aria-label="Product">
          <h3>Product</h3>
          <a href="#show">Features</a>
          <a href="#how">How it works</a>
          <a href="#looks">Looks</a>
          <Link to="/register">Sign up</Link>
        </nav>

        <nav className="footer-col" aria-label="Support">
          <h3>Support</h3>
          <button
            type="button"
            className="footer-link-btn"
            aria-expanded={note === "feedback"}
            onClick={() => toggle("feedback")}
          >
            Send feedback
          </button>
          {note === "feedback" && (
            <p className="footer-note" role="status">
              Feedback has its own page inside the app. <Link to="/login">Sign in</Link> and open Feedback in the side
              menu.
            </p>
          )}
          <button
            type="button"
            className="footer-link-btn"
            aria-expanded={note === "email"}
            onClick={() => toggle("email")}
          >
            hello@castwise.site
          </button>
          {note === "email" && (
            <div className="footer-note" role="status">
              <ol>
                <li>
                  Write to <a href="mailto:hello@castwise.site">hello@castwise.site</a>.
                </li>
                <li>Say what happened or what you need, and the email you sign in with.</li>
                <li>We answer in the same email thread, so keep the conversation there.</li>
              </ol>
            </div>
          )}
        </nav>

        <nav className="footer-col" aria-label="Connect">
          <h3>Connect</h3>
          {SOCIALS.map(({ label, href, Icon }) => (
            <a key={label} className="footer-social" href={href} target="_blank" rel="noopener noreferrer">
              <Icon />
              {label}
            </a>
          ))}
          <Link className="footer-social" to="/login">
            <LogIn size={16} aria-hidden="true" />
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default LandingFooter;
