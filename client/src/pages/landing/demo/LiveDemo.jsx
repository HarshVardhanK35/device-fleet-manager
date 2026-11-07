import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import "./liveDemo.css";
import UseCaseChooser from "../UseCaseChooser.jsx";
import { DEMO_DATA } from "./demoData.js";
import { EventCardScreen, NoticeBoardScreen, StatusBoardScreen } from "./DemoScreens.jsx";

const SCREENS = [
  { key: "board", label: "Menu board", Component: StatusBoardScreen, pick: (d) => d.board },
  { key: "notice", label: "Notice board", Component: NoticeBoardScreen, pick: (d) => d.notice },
  { key: "card", label: "Birthday card", Component: EventCardScreen, pick: (d) => d.card },
];
const DWELL_MS = 5000;

// The hero's live demo: a framed mock screen cycling menu board -> notice ->
// event card, with examples for the use case picked in the chooser (it listens
// for the `castwise:usecase` event). Layout: the chooser above the frame,
// previous / next beside it (on the frame's edges below 1280px), and a slim
// bar inside the frame's top with the screen name, position dots and pause.
// Picking a use case also scrolls the frame into view. Nothing plays until the visitor clicks Play; then it advances every 5 s.
// Visitors who prefer reduced motion never get auto-advance (no pause button),
// only the previous / next buttons.
// Used by: landing/Hero.jsx.
function LiveDemo() {
  const [useCase, setUseCase] = useState("Café");
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const frameRef = useRef(null);
  const [reduce] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const onPick = (e) => {
      if (!DEMO_DATA[e.detail?.value]) return;
      setUseCase(e.detail.value);
      // bring the frame into view so the visitor sees the change
      frameRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    };
    document.addEventListener("castwise:usecase", onPick);
    return () => document.removeEventListener("castwise:usecase", onPick);
  }, [reduce]);

  useEffect(() => {
    if (!playing) return undefined;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SCREENS.length), DWELL_MS);
    return () => clearTimeout(t);
  }, [playing, index]);

  const step = (d) => setIndex((i) => (i + d + SCREENS.length) % SCREENS.length);
  const start = () => {
    setStarted(true);
    setPlaying(!reduce);
  };

  const current = SCREENS[index];
  const Screen = current.Component;
  const hidden = { visibility: started ? "visible" : "hidden" };

  return (
    <div className="dm-wrap">
      <div className="dm-top">
        <UseCaseChooser />
      </div>

      <div className="dm-frame" ref={frameRef}>
        <button type="button" className="dm-btn dm-side dm-side--prev" style={hidden} aria-label="Previous screen" onClick={() => step(-1)} disabled={!started}>
          <ChevronLeft className="ic" aria-hidden="true" />
        </button>

        <div className="demo-bezel">
          <div className="demo-screen demo-screen--live" role="region" aria-label="Live demo">
            <div className="dm-bar">
              <span className="dm-bar__label" aria-live="polite">
                {current.label}
              </span>
              <span className="dm-bar__dots" aria-hidden="true">
                {SCREENS.map((s, i) => (
                  <i key={s.key} className={i === index ? "is-on" : ""} />
                ))}
              </span>
              {!reduce && started && (
                <button
                  type="button"
                  className="dm-pause"
                  aria-label={playing ? "Pause the demo" : "Resume the demo"}
                  onClick={() => setPlaying((p) => !p)}
                >
                  {playing ? <Pause className="ic" aria-hidden="true" /> : <Play className="ic" aria-hidden="true" />}
                </button>
              )}
            </div>

            {/* key remounts the screen so its entrance replays on every change */}
            <div className={`dm-stage${started ? "" : " dm-stage--idle"}`} key={`${current.key}-${useCase}`}>
              <Screen data={current.pick(DEMO_DATA[useCase])} />
            </div>
            {!started && (
              <button type="button" className="dm-start" onClick={start}>
                <Play className="ic" aria-hidden="true" />
                <span className="label-wide">Play the demo</span>
                <span className="label-narrow">Play</span>
              </button>
            )}
          </div>
        </div>

        <button type="button" className="dm-btn dm-side dm-side--next" style={hidden} aria-label="Next screen" onClick={() => step(1)} disabled={!started}>
          <ChevronRight className="ic" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default LiveDemo;
