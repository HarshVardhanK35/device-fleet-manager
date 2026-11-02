import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight } from "lucide-react";

import LiveDemo from "./demo/LiveDemo.jsx";

// Hero: badge, headline, lead, the two buttons and the live demo
// (which carries the use-case chooser).
// Used by: pages/Landing.jsx.
function Hero() {
  return (
    <section className="hero" id="top" data-reveal="load" aria-labelledby="hero-title">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />

      <div className="wrap">
        <div className="hero-intro" data-grid>
          <span className="badge">
            <span className="badge-dot" aria-hidden="true" />
            Works on any screen with a browser
          </span>
          <h1 className="display" id="hero-title">
            Turn any screen into something people read.
          </h1>
          <p className="lead">
            CastWise puts the right thing on your screen in minutes. It runs on any device with a browser: a TV, a tablet, a spare phone.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/register">
              Get started
              <ArrowRight className="ic" aria-hidden="true" />
            </Link>
            <a className="btn btn-text" href="#how">
              See how it works
              <ArrowDown className="ic" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="demo-block">
          <LiveDemo />
        </div>
      </div>
    </section>
  );
}

export default Hero;
