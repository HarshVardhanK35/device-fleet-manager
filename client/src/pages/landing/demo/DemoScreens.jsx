import { Info, OctagonAlert, TriangleAlert } from "lucide-react";

import { CARD_TYPES } from "./demoData.js";

// The three mock screens inside the landing live demo. They are plain markup
// sized in container units (see liveDemo.css), so they scale with the frame.
// Used by: demo/LiveDemo.jsx.

const STATUS_LABEL = { in: "In", low: "Low", out: "Out" };
const CONFETTI = Array.from({ length: 14 }, (_, i) => i);

export function StatusBoardScreen({ data }) {
  return (
    <div className="dm-screen dm-board">
      <div className="dm-board__head">
        <span className="dm-board__title">{data.title}</span>
        <span className="dm-board__legend">
          {["in", "low", "out"].map((s) => (
            <span key={s}>
              <i className={`dm-dot dm-dot--${s}`} />
              {STATUS_LABEL[s]}
            </span>
          ))}
        </span>
      </div>
      <ul className="dm-board__grid">
        {data.items.map((item) => (
          <li key={item.name} className={`dm-item dm-item--${item.status}`}>
            <span className="dm-item__name">{item.name}</span>
            {item.tag && <span className="dm-item__tag">{item.tag}</span>}
            <span className={`dm-item__status dm-item__status--${item.status}`}>
              <i className={`dm-dot dm-dot--${item.status}`} />
              {STATUS_LABEL[item.status]}
            </span>
          </li>
        ))}
      </ul>
      <div className="dm-banner">{data.banner}</div>
    </div>
  );
}

export function NoticeBoardScreen({ data }) {
  return (
    <div className="dm-screen dm-notices">
      <div className="dm-notice dm-notice--urgent">
        <span className="dm-notice__label">
          <OctagonAlert className="dm-ic" aria-hidden="true" />
          Urgent
        </span>
        <p>{data.urgent}</p>
      </div>
      <div className="dm-notice dm-notice--warning">
        <span className="dm-notice__label">
          <TriangleAlert className="dm-ic" aria-hidden="true" />
          Warning
        </span>
        <p>{data.warning}</p>
      </div>
      <div className="dm-notice dm-notice--info">
        <span className="dm-notice__label">
          <Info className="dm-ic" aria-hidden="true" />
          Info
        </span>
        <p>{data.info}</p>
      </div>
    </div>
  );
}

export function EventCardScreen({ data }) {
  const type = CARD_TYPES[data.type];
  const Icon = type.icon;
  return (
    <div className="dm-screen dm-card">
      <div className="dm-confetti" aria-hidden="true">
        {CONFETTI.map((i) => (
          <i key={i} style={{ "--i": i }} />
        ))}
      </div>
      <div className="dm-card__text">
        <span className="dm-card__badge">{data.badge}</span>
        <span className="dm-card__kicker">
          <Icon className="dm-ic" aria-hidden="true" />
          {type.label}
        </span>
        <span className="dm-card__rule" />
        <span className="dm-card__title">{data.title}</span>
        <span className="dm-card__message">{data.message}</span>
      </div>
      <div className="dm-card__photo" aria-hidden="true">
        <span>{data.initial}</span>
      </div>
    </div>
  );
}
