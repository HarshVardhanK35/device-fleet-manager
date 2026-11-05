import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Clock, X } from "lucide-react";

import { createFeedback } from "../../api/feedback.js";
import { notifyFeedbackChanged } from "../../hooks/useFeedbackIndicator.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import LoadingOverlay from "../loading/LoadingOverlay.jsx";
import {
  FEEDBACK_EMAIL,
  FEEDBACK_MESSAGE_MAX,
  TYPE_LABEL,
} from "../../utils/feedbackMeta.js";
import { FbButton, FooterRight, FooterSplit } from "./FeedbackButtons.jsx";

const INPUT =
  "w-full bg-bg-primary border rounded-md text-sm text-text-primary outline-none transition-colors focus-visible:border-accent-blue focus-visible:ring-[3px] focus-visible:ring-accent-blue/25 disabled:opacity-50";
const INVALID = "border-[#f85149] ring-[3px] ring-[rgba(248,81,73,.15)]";

function NewFeedbackBody({ remaining, limit, onClose, onSent }) {
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [typeErr, setTypeErr] = useState(false);
  const [msgErr, setMsgErr] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const blocked = remaining <= 0;
  const atLimit = message.length >= FEEDBACK_MESSAGE_MAX;
  const note = atLimit ? "You've reached the 500 character limit." : msgErr ? "Write a message." : "";

  const [send, sending] = useAsyncAction(async () => {
    if (blocked) return;
    const noType = !type;
    const noMessage = !message.trim();
    setTypeErr(noType);
    setMsgErr(noMessage);
    if (noType || noMessage) return;
    setServerErr("");
    const res = await createFeedback({ type, message: message.trim() });
    if (!res?._id) {
      setServerErr(res?.message || "Couldn't send your message. Try again.");
      return;
    }
    notifyFeedbackChanged();
    onSent();
  });

  const buttons = (
    <>
      <FbButton onClick={onClose} disabled={sending}>
        <span className="hidden md:inline">Cancel</span>
        <span className="md:hidden">Close</span>
      </FbButton>
      <FbButton variant="primary" onClick={send} disabled={blocked || sending} className="md:px-[18px]">
        Send
      </FbButton>
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between pl-5 pr-3 pt-3 pb-1">
        <Dialog.Title className="m-0 text-[17px] font-semibold text-text-primary">New feedback</Dialog.Title>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-11 h-11 md:w-9 md:h-9 rounded-md grid place-items-center text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <Dialog.Description className="sr-only">Send a message to the admin</Dialog.Description>

      <div className="flex flex-col gap-4 px-5 pt-2 pb-5 overflow-y-auto">
        {blocked && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-lg bg-[rgba(227,179,65,.14)] px-3.5 py-3 text-sm text-text-primary"
          >
            <Clock size={17} className="flex-none mt-0.5 text-[#e3b341]" />
            <span>
              <strong className="font-semibold">You&apos;ve used all {limit} feedback messages.</strong> For
              anything else, email{" "}
              <a className="text-accent-blue hover:underline" href={`mailto:${FEEDBACK_EMAIL}`}>
                {FEEDBACK_EMAIL}
              </a>
              .
            </span>
          </div>
        )}

        <div className={`flex flex-col gap-4 ${blocked ? "opacity-50" : ""}`}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fb-type" className="text-[13px] font-medium text-text-primary">
              Type
            </label>
            <span className="relative block">
              <select
                id="fb-type"
                value={type}
                disabled={blocked}
                onChange={(e) => {
                  setType(e.target.value);
                  setTypeErr(false);
                }}
                aria-invalid={typeErr}
                className={`${INPUT} appearance-none h-11 md:h-9 pl-3 pr-9 ${typeErr ? INVALID : "border-border-muted"} ${type ? "" : "text-text-muted"}`}
              >
                <option value="" disabled hidden>
                  Choose a type
                </option>
                {Object.entries(TYPE_LABEL).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </span>
            {typeErr && (
              <span role="alert" className="text-[13px] text-[#ff7b72]">
                Choose a type.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="fb-msg" className="text-[13px] font-medium text-text-primary">
              Message
            </label>
            <textarea
              id="fb-msg"
              value={message}
              disabled={blocked}
              maxLength={FEEDBACK_MESSAGE_MAX}
              placeholder="Describe the issue or idea in a few sentences."
              onChange={(e) => {
                setMessage(e.target.value);
                setMsgErr(false);
              }}
              aria-invalid={!!note}
              className={`${INPUT} min-h-[132px] md:min-h-[128px] px-3 py-2.5 resize-y ${note ? INVALID : "border-border-muted"}`}
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

      <FooterRight>{buttons}</FooterRight>
      <FooterSplit>{buttons}</FooterSplit>
      <LoadingOverlay show={sending} />
    </>
  );
}

// The "New feedback" dialog. `remaining` / `limit` come from the server
// (GET /feedback/mine). Mounted fresh on every open, so a draft never lingers.
function NewFeedbackModal({ open, onOpenChange, remaining, limit, onSent }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="cw-scrim-in fixed inset-0 z-30 bg-black/65 backdrop-blur-sm" />
        <Dialog.Content className="cw-pop-in fixed z-40 left-3 right-3 top-16 md:left-0 md:right-0 md:mx-auto md:top-[200px] md:w-[600px] lg:top-[120px] lg:w-[560px] max-h-[calc(100dvh-80px)] flex flex-col bg-bg-panel border border-border-muted rounded-[14px] md:rounded-xl shadow-2xl outline-none">
          {open && (
            <NewFeedbackBody
              remaining={remaining}
              limit={limit}
              onClose={() => onOpenChange(false)}
              onSent={onSent}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default NewFeedbackModal;

// Used by: pages/Feedback.jsx.
