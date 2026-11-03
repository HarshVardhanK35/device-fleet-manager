import { useEffect, useRef, useState } from "react";
import { Cloud, CloudRain, CloudSun, Coffee, Home, Image as ImageIcon, ListVideo, LogOut, MonitorPlay, Newspaper, PlaySquare, Sun, User } from "lucide-react";

import Logo from "../../../components/layout/Logo.jsx";
import "../demo/liveDemo.css";
import "./shots.css";
import { DEMO_DATA } from "../demo/demoData.js";
import { EventCardScreen, NoticeBoardScreen, StatusBoardScreen } from "../demo/DemoScreens.jsx";

// Illustrations for the landing page's image spots: small mock screens built
// in markup (same approach as the live demo), sized in container units so they
// scale with their frame. Swap any of them for a real <img> later; the frame
// keeps its aspect ratio from landing.css.
// Used by: landing/LandingSections.jsx (through ShotFrame).

const CAFE = DEMO_DATA["Café"];

function WeatherScreen() {
  const days = [
    { d: "Tue", Icon: Sun, hi: "24°", lo: "17°" },
    { d: "Wed", Icon: CloudSun, hi: "22°", lo: "16°" },
    { d: "Thu", Icon: CloudRain, hi: "19°", lo: "14°" },
    { d: "Fri", Icon: Cloud, hi: "21°", lo: "15°" },
  ];
  return (
    <div className="dm-screen sw-weather">
      <div className="sw-weather__now">
        <span className="sw-weather__city">Lisbon</span>
        <span className="sw-weather__temp">
          <Sun className="dm-ic" aria-hidden="true" />
          24°
        </span>
        <span className="sw-weather__sub">Sunny, feels like 26°</span>
      </div>
      <ul className="sw-weather__days">
        {days.map(({ d, Icon, hi, lo }) => (
          <li key={d}>
            <span>{d}</span>
            <Icon className="dm-ic" aria-hidden="true" />
            <b>{hi}</b>
            <span className="sw-weather__lo">{lo}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClockScreen() {
  return (
    <div className="dm-screen sw-clock">
      <span className="sw-clock__time">
        10:42<small>AM</small>
      </span>
      <span className="sw-clock__date">Tuesday, 4 November</span>
      <span className="sw-clock__city">Lisbon</span>
    </div>
  );
}

function FeedScreen() {
  return (
    <div className="dm-screen sw-feed">
      <div className="sw-feed__img">
        <Newspaper className="dm-ic" aria-hidden="true" />
      </div>
      <div className="sw-feed__text">
        <span className="sw-feed__kicker">City News</span>
        <span className="sw-feed__title">Council approves a new riverside park</span>
        <span className="sw-feed__desc">Work starts in spring and the first section opens next summer.</span>
        <span className="sw-feed__bar" />
      </div>
    </div>
  );
}

function PhotoScreen() {
  return (
    <div className="dm-screen sw-photo">
      <Coffee className="sw-photo__icon" aria-hidden="true" />
    </div>
  );
}

function DashboardScreen() {
  const nav = [
    { label: "Dashboard", Icon: Home },
    { label: "Content", Icon: ImageIcon },
    { label: "Playlists", Icon: ListVideo },
    { label: "Assignments", Icon: MonitorPlay },
    { label: "Player", Icon: PlaySquare },
  ];
  const screens = [
    { name: "Lobby TV", state: "Playing", tone: "in" },
    { name: "Café menu", state: "Playing", tone: "in" },
    { name: "Waiting room", state: "Offline", tone: "out" },
  ];
  const tiles = ["Café menu", "Notices", "Birthdays", "Weather"];
  const limits = [
    { label: "Images", value: "8 of 30", pct: 27, tone: "in" },
    { label: "Video", value: "40 of 150 MB", pct: 27, tone: "in" },
    { label: "Screens", value: "3 of 3", pct: 100, tone: "out" },
  ];
  return (
    <div className="dm-screen sd">
      <header className="sd__bar">
        <Logo size="3.6cqw" />
        <span className="sd__brand">CastWise</span>
        <span className="sd__spacer" />
        <span className="sd__avatar">
          <User className="dm-ic" aria-hidden="true" />
        </span>
        <LogOut className="dm-ic sd__logout" aria-hidden="true" />
      </header>
      <div className="sd__body">
        <nav className="sd__side">
          {nav.map(({ label, Icon }, i) => (
            <span key={label} className={`sd__nav${i === 0 ? " is-on" : ""}`}>
              <Icon className="dm-ic" aria-hidden="true" />
              {label}
            </span>
          ))}
        </nav>
      <div className="sd__main">
        <span className="sd__title">Dashboard</span>
        <div className="sd__grid">
          <div className="sd__panel">
            <span className="sd__h">Screens</span>
            {screens.map((s) => (
              <div className="sd__row" key={s.name}>
                <span>{s.name}</span>
                <span className={`dm-item__status dm-item__status--${s.tone}`}>
                  <i className={`dm-dot dm-dot--${s.tone}`} />
                  {s.state}
                </span>
              </div>
            ))}
          </div>
          <div className="sd__panel">
            <span className="sd__h">Recently created</span>
            <div className="sd__tiles">
              {tiles.map((t, i) => (
                <div className="sd__tile" key={t} style={{ "--k": i }}>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="sd__short">
            {["Content", "Playlists", "Assignments"].map((s) => (
              <div className="sd__panel sd__shortcut" key={s}>
                {s}
              </div>
            ))}
          </div>
        </div>
        <div className="sd__limits">
          {limits.map((l) => (
            <div className="sd__limit" key={l.label}>
              <span>
                {l.label}
                <b>{l.value}</b>
              </span>
              <span className="sd__track">
                <i className={`sd__fill sd__fill--${l.tone}`} style={{ width: `${l.pct}%` }} />
              </span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

// The same board, dark on the left half and light on the right.
function LightDarkShot() {
  return (
    <>
      <div className="shot-dark sc-dark">
        <StatusBoardScreen data={CAFE.board} />
      </div>
      <div className="shot-light sc-light">
        <StatusBoardScreen data={CAFE.board} />
      </div>
      <span className="shot-split" />
    </>
  );
}

// The same line in three fonts.
function FontsShot() {
  const rows = [
    { tag: "Sans", family: "var(--font)" },
    { tag: "Serif", family: "Georgia, 'Times New Roman', serif" },
    { tag: "Mono", family: "ui-monospace, 'Courier New', monospace" },
  ];
  return (
    <div className="dm-screen sf">
      {rows.map((r) => (
        <div className="sf__row" key={r.tag}>
          <span className="sf__text" style={{ fontFamily: r.family }}>
            Welcome to the café
          </span>
          <span className="sf__tag">{r.tag}</span>
        </div>
      ))}
    </div>
  );
}

// The same urgent message with the glow off and on.
function EffectsShot() {
  return (
    <div className="dm-screen se">
      {[false, true].map((on) => (
        <div className={`se__cell${on ? " is-on" : ""}`} key={String(on)}>
          <span className="se__tag">{on ? "Glow on" : "Glow off"}</span>
          <span className="se__text">Machine 2 is down</span>
        </div>
      ))}
    </div>
  );
}

// Renders its children on a fixed-size canvas and scales it to the box width.
function Scaled({ w, h, className = "", children }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    const measure = () => setScale(el.clientWidth / w);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div className="so-dev" ref={ref} style={{ aspectRatio: `${w} / ${h}` }}>
      <div className={`so-canvas ${className}`} style={{ width: w, height: h, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

// The same board on a landscape and a portrait screen.
function OrientationShot() {
  return (
    <div className="so">
      <div className="so__land">
        <Scaled w={1120} h={630}>
          <StatusBoardScreen data={CAFE.board} />
        </Scaled>
      </div>
      <div className="so__port">
        <Scaled w={360} h={640} className="so-portrait">
          <StatusBoardScreen data={CAFE.board} />
        </Scaled>
      </div>
    </div>
  );
}

const SHOTS = {
  board: () => <StatusBoardScreen data={CAFE.board} />,
  notices: () => <NoticeBoardScreen data={CAFE.notice} />,
  card: () => <EventCardScreen data={CAFE.card} />,
  weather: WeatherScreen,
  clock: ClockScreen,
  feed: FeedScreen,
  photo: PhotoScreen,
  dashboard: DashboardScreen,
  lightdark: LightDarkShot,
  fonts: FontsShot,
  effects: EffectsShot,
  orientation: OrientationShot,
};

// One image spot: keeps the filler's aspect ratio from landing.css and draws
// the named illustration inside it.
export function ShotFrame({ kind, alt }) {
  const Shot = SHOTS[kind];
  return (
    <div className="shot-ph shot-live" role="img" aria-label={`Illustration: ${alt}`}>
      <Shot />
    </div>
  );
}
