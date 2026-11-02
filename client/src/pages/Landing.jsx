import { useRef } from "react";

import "./landing/landing.css";
import Hero from "./landing/Hero.jsx";
import LandingFooter from "./landing/LandingFooter.jsx";
import LandingHeader from "./landing/LandingHeader.jsx";
import { AnyDevice, ClosingCta, Control, HowItWorks, Looks, WhatToShow } from "./landing/LandingSections.jsx";
import { useLandingTheme } from "./landing/useLandingTheme.js";
import { usePageChrome } from "./landing/usePageChrome.js";
import { useReveal } from "./landing/useReveal.js";

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
        <HowItWorks />
        <WhatToShow />
        <Control />
        <Looks />
        <AnyDevice />
        <ClosingCta />
      </main>
      <LandingFooter />
    </div>
  );
}

export default Landing;
