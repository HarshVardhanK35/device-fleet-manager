import { Check, ChevronDown, Link2 } from "lucide-react";

import HelpAnswer from "./HelpAnswer.jsx";

// One question card of the accordion. The answer is always in the page (closed ones are inert and
// collapsed to zero height), so search and the browser's find see all of them.
//   open / linked / copied  which state the card is in (linked = opened from a #link)
function HelpQuestion({ question, open, linked, copied, onToggle, onCopy }) {
  const { id } = question;
  return (
    <div className={`hp-q${open ? " is-open" : ""}${linked ? " is-linked" : ""}`} id={id}>
      <div className="hp-q__head">
        <button
          type="button"
          className="hp-q__toggle"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
        >
          <span>{question.q}</span>
          {linked && (
            <span className="hp-q__linked-tag">
              <Link2 size={12} aria-hidden="true" />
              Opened from link
            </span>
          )}
        </button>
        <span className="hp-q__copy-wrap">
          <button
            type="button"
            className="hp-icon-btn"
            title="Copy link to this question"
            aria-label="Copy link to this question"
            onClick={onCopy}
          >
            <Link2 size={16} aria-hidden="true" />
          </button>
          {copied && (
            <span className="hp-tooltip" role="status">
              <Check size={12} aria-hidden="true" />
              Link copied
            </span>
          )}
        </span>
        <span className="hp-q__chev" aria-hidden="true" onClick={onToggle}>
          <ChevronDown size={16} />
        </span>
      </div>
      <div className="hp-q__panel" id={`${id}-panel`} role="region" aria-labelledby={`${id}-btn`}>
        <div className="hp-q__clip" inert={!open}>
          <div className="hp-q__body">
            <HelpAnswer blocks={question.blocks} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpQuestion;

// Used by: pages/Help.jsx.
