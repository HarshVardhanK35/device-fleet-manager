import { Clock, Tag } from "lucide-react";

import StyledSelect from "../ui/StyledSelect.jsx";

import {
  FEEDBACK_EMAIL,
  FEEDBACK_MESSAGE_MAX,
  TYPE_LABEL,
} from "../../utils/feedbackMeta.js";

const INPUT =
  "w-full bg-bg-primary border rounded-md text-sm text-text-primary outline-none transition-colors focus-visible:border-accent-blue focus-visible:ring-[3px] focus-visible:ring-accent-blue/25 disabled:opacity-50";
const TYPE_OPTIONS = Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label }));

// The red star that marks a required field.
function Required() {
  return (
    <span className="text-[#f85149]" aria-hidden="true" title="Required">
      *
    </span>
  );
}

const INVALID = "border-[#f85149] ring-[3px] ring-[rgba(248,81,73,.15)]";

// The fields of the New feedback form (type, message, the "n of 5 left" note
// and the warning), drawn from the state of useFeedbackForm. `id` keeps the
// field ids unique when the modal and the inline form could both exist.
function FeedbackFields({ form, id = "fb", portalContainer }) {
  const { blocked, type, setType, typeErr, message, setMessage, note, atLimit, serverErr, remaining, limit } = form;

  return (
    <div className="flex flex-col gap-4">
      {blocked && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg bg-[rgba(227,179,65,.14)] px-3.5 py-3 text-sm text-text-primary"
        >
          <Clock size={17} className="flex-none mt-0.5 text-[#e3b341]" />
          <span>
            <strong className="font-semibold">You&apos;ve used all {limit} feedback messages.</strong> For anything
            else, email{" "}
            <a className="text-accent-blue hover:underline" href={`mailto:${FEEDBACK_EMAIL}`}>
              {FEEDBACK_EMAIL}
            </a>
            .
          </span>
        </div>
      )}

      <div className={`flex flex-col gap-4 ${blocked ? "opacity-50" : ""}`}>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-text-primary">
            Type <Required />
          </span>
          <StyledSelect
            label="Type"
            icon={Tag}
            value={type}
            onChange={setType}
            options={TYPE_OPTIONS}
            placeholder="Choose a type"
            invalid={typeErr}
            disabled={blocked}
            collapseOnMobile={false}
            matchTriggerWidth
            touchSize
            portalContainer={portalContainer}
          />
          {typeErr && (
            <span role="alert" className="text-[13px] text-[#ff7b72]">
              Choose a type.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-msg`} className="text-[13px] font-medium text-text-primary">
            Message <Required />
          </label>
          <textarea
            id={`${id}-msg`}
            value={message}
            disabled={blocked}
            maxLength={FEEDBACK_MESSAGE_MAX}
            placeholder="Describe the issue or idea in a few sentences."
            onChange={(e) => setMessage(e.target.value)}
            aria-invalid={!!note}
            className={`${INPUT} dark-scrollbar min-h-[132px] md:min-h-[128px] max-h-[260px] px-3 py-2.5 resize-y ${note ? INVALID : "border-border-muted"}`}
          />
          <div className="flex items-start justify-between gap-3">
            <span role="alert" className="flex-1 text-[13px] text-[#ff7b72]">
              {note}
            </span>
            <span className={`text-xs tabular-nums ${atLimit ? "text-[#ff7b72] font-semibold" : "text-text-muted"}`}>
              {message.length} / {FEEDBACK_MESSAGE_MAX}
            </span>
          </div>
        </div>
      </div>

      {serverErr && (
        <p role="alert" className="m-0 text-[13px] text-[#ff7b72]">
          {serverErr}
        </p>
      )}

      <div className="flex flex-col gap-0.5 rounded-lg bg-bg-primary px-3 py-2.5">
        <span className="text-[13px] font-semibold text-text-primary">
          {Math.max(remaining, 0)} of {limit} left
        </span>
        <span className="text-[13px] leading-snug text-text-muted">
          Sending uses one of your {limit}. Deleting a message doesn&apos;t give it back.
        </span>
      </div>
    </div>
  );
}

export default FeedbackFields;

// Used by: components/feedback/NewFeedbackModal.jsx, InlineFeedbackForm.jsx.
