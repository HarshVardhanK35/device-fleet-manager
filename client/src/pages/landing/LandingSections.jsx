import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { SectionHead } from "./landingParts.jsx";
import { ShotFrame } from "./shots/ShotScreens.jsx";
import { CONTROLS, DEVICES, FEATURES, LOOKS, OFFLINE_POINTS, STEPS } from "./landingData.js";

// The content sections between the hero and the footer. Each is a
// [data-reveal] section so useReveal can animate it on scroll.
// Used by: pages/Landing.jsx.

export function HowItWorks() {
  return (
    <section className="section" id="how" data-reveal aria-labelledby="how-title">
      <div className="wrap">
        <SectionHead
          eyebrow="How it works"
          id="how-title"
          title="On screen in three steps"
          lead="If the screen has a browser, you're most of the way there."
        />
        <ol className="steps" data-grid>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li className="step card card--shadow" key={s.title}>
                <div className="step-top">
                  <span className="step-num">Step 0{i + 1}</span>
                  <span className="tile" aria-hidden="true">
                    <Icon className="ic" />
                  </span>
                </div>
                <h3>{s.title}</h3>
                <p className="body">{s.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function WhatToShow() {
  return (
    <section className="section" id="show" data-reveal aria-labelledby="show-title">
      <div className="wrap">
        <SectionHead
          wide
          eyebrow="What to show"
          id="show-title"
          title="Put the right thing on screen"
          lead="Mix menus, notices, celebrations, weather and your own media. Each one keeps itself up to date."
        />
        <div className="bento" data-grid>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            const cls = f.kind === "big" ? " feat--big" : f.kind === "wide" ? " feat--wide" : "";
            return (
              <article className={`feat${cls} card card--shadow`} style={{ "--d-order": f.order }} key={f.kicker}>
                <div className="feat-text">
                  <div className="feat-kicker">
                    <span className="tile" aria-hidden="true">
                      <Icon className="ic" />
                    </span>
                    {f.kicker}
                  </div>
                  <h3>{f.title}</h3>
                  <p className="body">{f.text}</p>
                  {f.legend && (
                    <div className="legend">
                      {f.legend.map(([color, name]) => (
                        <span key={name}>
                          <b className={`dot-${color}`} aria-hidden="true" />
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                  {f.chips && (
                    <ul className="chips">
                      {f.chips.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="feat-media">
                  <div className="shot">
                    <ShotFrame kind={f.shot} alt={f.alt} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Offline() {
  return (
    <section className="section" id="offline" data-reveal aria-labelledby="offline-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Always on"
          id="offline-title"
          title="Keeps playing when the internet drops"
          lead="Your screen saves what it is showing while it's online. If the connection goes, it carries on with its saved playlist, then comes back in sync."
        />
        <figure className="offline-visual">
          <ShotFrame kind="offline" alt="a screen marked offline that keeps playing its saved notice" />
        </figure>
        <div className="controls" data-grid>
          {OFFLINE_POINTS.map((p) => {
            const Icon = p.icon;
            return (
              <div className="ctrl card" key={p.title}>
                <span className="tile" aria-hidden="true">
                  <Icon className="ic" />
                </span>
                <div className="ctrl-text">
                  <h3>{p.title}</h3>
                  <p className="body">{p.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="offline-note">A screen needs to play online once before it can work offline.</p>
      </div>
    </section>
  );
}

export function Control() {
  return (
    <section className="section" id="control" data-reveal aria-labelledby="control-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Control"
          id="control-title"
          title="Stay in charge of every screen"
          lead="Plan what plays, check it before it goes live, and step in when you need to."
        />
        <figure className="browser">
          <div className="browser-bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <span className="browser-url" />
            <span className="browser-spacer" />
          </div>
          <ShotFrame kind="dashboard" alt="the dashboard listing every screen and whether it is playing or needs attention" />
        </figure>
        <div className="controls" data-grid>
          {CONTROLS.map((c) => {
            const Icon = c.icon;
            return (
              <div className="ctrl card" key={c.title}>
                <span className="tile" aria-hidden="true">
                  <Icon className="ic" />
                </span>
                <div className="ctrl-text">
                  <h3>{c.title}</h3>
                  <p className="body">{c.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Looks() {
  return (
    <section className="section" id="looks" data-reveal aria-labelledby="looks-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Looks"
          id="looks-title"
          title="Make it look like it belongs"
          lead="Match your space, your brand and the way the screen is mounted."
        />
        <div className="looks" data-grid>
          {LOOKS.map((l) => {
            const Icon = l.icon;
            return (
              <div className="look card" key={l.title}>
                <ShotFrame kind={l.shot} alt={l.alt} />
                <div className="look-text">
                  <h3>
                    <Icon className="ic" aria-hidden="true" />
                    {l.title}
                  </h3>
                  <p className="body">{l.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AnyDevice() {
  return (
    <section className="section" id="devices" data-reveal aria-labelledby="devices-title">
      <div className="wrap devices-wrap">
        <span className="eyebrow">Any device</span>
        <h2 className="h2" id="devices-title">
          Works on the screen you already have
        </h2>
        <p className="lead">If it has a web browser, it can run CastWise. Open the page, enter the code, and it's ready.</p>
        <ul className="devices" data-grid>
          {DEVICES.map((d) => {
            const Icon = d.icon;
            return (
              <li className="device" key={d.label}>
                <Icon className="ic" aria-hidden="true" />
                {d.label}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section className="cta-section" data-reveal aria-labelledby="cta-title">
      <div className="wrap">
        <div className="cta">
          <div className="cta-glow" aria-hidden="true" />
          <h2 id="cta-title">Your screen is ready when you are.</h2>
          <p className="lead">Pair your first screen in a few minutes.</p>
          <Link className="btn btn-primary btn-xl" to="/register">
            Get started
            <ArrowRight className="ic" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
