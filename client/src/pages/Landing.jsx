import { Suspense, lazy, useRef } from "react";

// Inter is self-hosted (only the weights the page uses) and loads with this
// page, not with the whole app.
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "./landing/landing.css";
import Hero from "./landing/Hero.jsx";
import LandingFooter from "./landing/LandingFooter.jsx";
import LandingHeader from "./landing/LandingHeader.jsx";
import { useLandingTheme } from "./landing/useLandingTheme.js";
import { usePageChrome } from "./landing/usePageChrome.js";
import { useReveal } from "./landing/useReveal.js";

// The sections under the hero load as their own file, right after the hero
// paints. Until they arrive, this keeps the page tall enough to scroll and
// keeps the header's anchor links pointing somewhere.
const BelowFold = lazy(() => import("./landing/BelowFold.jsx"));

function BelowFoldPlaceholder() {
  return (
    <div aria-hidden="true" style={{ minHeight: "240vh" }}>
      {["how", "show", "offline", "control", "looks", "devices"].map((id) => (
        <span key={id} id={id} />
      ))}
    </div>
  );
}

// The public landing page, shown at "/" to signed-out visitors (App.jsx).
// Reference: z-CastWise-A1-package (SPEC / COPY / css / js). Styles are
// scoped under .cw (landing/landing.css); the theme is local to this page.
// The live demo frame is reserved and empty until the demo is built.
// Used by: App.jsx (HomeRoute).
function Landing() {
  const rootRef = useRef(null);
  const [theme, toggleTheme] = useLandingTheme();

  useReveal(rootRef);
  usePageChrome(theme);

  return (
    <div className="cw" data-theme={theme} ref={rootRef}>
      <a className="visually-hidden skip-link" href="#main">
        Skip to content
      </a>
      <LandingHeader theme={theme} onToggleTheme={toggleTheme} />
      <main id="main">
        <Hero />
        <Suspense fallback={<BelowFoldPlaceholder />}>
          <BelowFold />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}

export default Landing;
