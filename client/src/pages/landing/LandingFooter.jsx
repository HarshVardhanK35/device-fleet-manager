import { Link } from "react-router-dom";

import { BrandMark } from "./landingParts.jsx";

// One-line footer: logo, tagline, Sign in.
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
        <Link className="footer-signin" to="/login">
          Sign in
        </Link>
      </div>
    </footer>
  );
}

export default LandingFooter;
