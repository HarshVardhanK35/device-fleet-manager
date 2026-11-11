import { useEffect, useRef, useState } from "react";
import { Check, Copy, Lightbulb } from "lucide-react";

import { HELP_EMAIL } from "./helpContent.js";

// The address a screen's browser opens to pair.
const SCREENS_URL = "castwise.site/screens";
const escapeDots = (s) => s.replace(/\./g, "\\.");
const MARKS = new RegExp(`(\\[\\[[^\\]]+\\]\\]|${escapeDots(HELP_EMAIL)}|${escapeDots(SCREENS_URL)})`);
const COPIED_MS = 1600;

// A piece of text to copy (an email address or a web address) with a small copy button. Plain text,
// not a link: a mailto link does nothing on a computer without a mail app, and the screens address
// is typed on the TV.
function CopyText({ text, what }) {
  const [done, setDone] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  function copy() {
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      /* the text is on screen: it can still be selected and copied by hand */
    }
    setDone(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), COPIED_MS);
  }

  return (
    <span className="hp-email">
      {text}
      <button
        type="button"
        className={`hp-email__copy${done ? " is-done" : ""}`}
        title={done ? "Copied" : `Copy ${what}`}
        aria-label={done ? `${what} copied` : `Copy ${what}`}
        onClick={copy}
      >
        {done ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      </button>
    </span>
  );
}

export const CopyEmail = () => <CopyText text={HELP_EMAIL} what="email address" />;

// A string with its marks drawn: [[Name]] as a button-name chip, the help address as a link.
export function RichText({ text }) {
  return text
    .split(MARKS)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith("[[")) {
        return (
          <span key={i} className="hp-kbd">
            {part.slice(2, -2)}
          </span>
        );
      }
      if (part === HELP_EMAIL) return <CopyEmail key={i} />;
      if (part === SCREENS_URL) return <CopyText key={i} text={SCREENS_URL} what="address" />;
      return part;
    });
}

// One block of an answer: paragraph, numbered steps, bullets, the limits table or a tip.
function HelpBlock({ block }) {
  if (block.p) {
    return (
      <p className="hp-p">
        <RichText text={block.p} />
      </p>
    );
  }
  if (block.steps) {
    return (
      <ol className="hp-steps">
        {block.steps.map((step, i) => (
          <li key={i}>
            <span className="hp-steps__n" aria-hidden="true">
              {i + 1}
            </span>
            <span>
              <RichText text={step} />
            </span>
          </li>
        ))}
      </ol>
    );
  }
  if (block.ul) {
    return (
      <ul className="hp-bullets">
        {block.ul.map((item, i) => (
          <li key={i}>
            <span>
              <RichText text={item} />
            </span>
          </li>
        ))}
      </ul>
    );
  }
  if (block.table) {
    return (
      <div className="hp-table" role="table">
        <div className="hp-table__row hp-table__head" role="row">
          <span role="columnheader">Item</span>
          <span role="columnheader">Limit</span>
        </div>
        {block.table.map(([key, value]) => (
          <div key={key} className="hp-table__row" role="row">
            <span role="cell">{key}</span>
            <span role="cell">{value}</span>
          </div>
        ))}
      </div>
    );
  }
  if (block.tip) {
    return (
      <div className="hp-tip">
        <span className="hp-tip__label">
          <Lightbulb size={15} fill="currentColor" aria-hidden="true" />
          Tip
        </span>
        <span className="hp-tip__text">
          <RichText text={block.tip} />
        </span>
      </div>
    );
  }
  return null;
}

function HelpAnswer({ blocks }) {
  return blocks.map((block, i) => <HelpBlock key={i} block={block} />);
}

export default HelpAnswer;

// The answer components of the Help page (spec: z-CastWise-Help/SPEC.md section 4).
// Used by: pages/help/HelpQuestion.jsx.
