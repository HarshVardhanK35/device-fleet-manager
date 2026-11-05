import { Link } from "react-router-dom";

import { BrandMark } from "./landingParts.jsx";

// One-line footer: logo, tagline, social links, Sign in.
// Used by: pages/Landing.jsx.
function LandingFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <a className="brand" href="#top" aria-label="CastWise home">
          <BrandMark size={24} />
          <span className="brand-name">CastWise</span>
        </a>
        <span>Turn any screen into a managed sign.</span>
        <span className="footer-links">
          <a
            className="footer-signin"
            href="https://www.linkedin.com/company/cast-wise"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            className="footer-signin"
            href="https://github.com/cast-wise"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            className="footer-signin"
            href="https://x.com/castwisehq"
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>
          <Link className="footer-signin" to="/login">
            Sign in
          </Link>
        </span>
      </div>
    </footer>
  );
}

export default LandingFooter;
