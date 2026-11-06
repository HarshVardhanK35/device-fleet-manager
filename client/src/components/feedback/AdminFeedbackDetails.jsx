import { useState } from "react";
import { CircleAlert, Trash2 } from "lucide-react";

import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import {
  FEEDBACK_REPLY_MAX,
  STATUS_LABEL,
  STATUS_STYLE,
  formatFeedbackDateTime,
} from "../../utils/feedbackMeta.js";
import DetailsShell from "./DetailsShell.jsx";
import StatusBadge from "./StatusBadge.jsx";
import { FbButton, FooterRight, FooterSplit } from "./FeedbackButtons.jsx";

// What the admin can decide (Seen is only set by opening a Sent message).
const CHOICES = ["noted", "not-planned"];

const LABEL = "text-[13px] font-medium text-text-primary";
const NOTE = "text-xs text-text-muted";
const FIELD =
  "w-full bg-bg-primary border rounded-md text-sm text-text-primary outline-none transition-colors focus-visible:border-accent-blue focus-visible:ring-[3px] focus-visible:ring-accent-blue/25";

function sender(item) {
  const u = item.userId || {};
  return {
    fullName: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Deleted user",
    username: u.username || "",
    email: u.email || "",
  };
}

function AdminBody({ item, onClose, onSave, onAskDelete }) {
  const [status, setStatus] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const from = sender(item);

  // One decision per message: once it is Noted or Not planned nothing changes.
  const answered = item.status !== "sent" && item.status !== "seen";
  const notPlanned = !answered && status === "not-planned";

  const [save, saving] = useAsyncAction(async () => {
    if (answered) return;
    if (!status) {
      setError("Choose Noted or Not planned.");
      return;
    }
    const text = reply.trim();
    if (notPlanned && !text) {
      setError("Add a reason to save as Not planned. The user sees it with the status.");
      return;
    }
    setError("");
    const problem = await onSave(item._id, { status, reply: text });
    if (problem) setError(problem);
  });

  const deleteInline = answered && (
    <FbButton variant="ghostDanger" onClick={onAskDelete} className="md:hidden self-start -ml-3.5">
      <Trash2 size={17} />
      Delete message
    </FbButton>
  );

  const buttons = answered ? (
    <FbButton onClick={onClose}>Close</FbButton>
  ) : (
    <>
      <FbButton onClick={onClose}>
        <span className="hidden md:inline">Cancel</span>
        <span className="md:hidden">Close</span>
      </FbButton>
      <FbButton variant="primary" onClick={save} disabled={saving} className="md:px-4">
        {saving ? "Saving…" : "Save"}
      </FbButton>
    </>
  );

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-5">
        <div className="flex flex-col gap-[3px]">
          <span className="text-base font-semibold text-text-primary [overflow-wrap:anywhere]">{from.fullName}</span>
          {from.username && <span className="text-[13px] text-text-muted">@{from.username}</span>}
          {from.email && (
            <a className="text-[13px] text-accent-blue hover:underline [overflow-wrap:anywhere]" href={`mailto:${from.email}`}>
              {from.email}
            </a>
          )}
          <span className="pt-1 text-xs text-text-muted">{formatFeedbackDateTime(item.createdAt)}</span>
        </div>

        <p className="m-0 whitespace-pre-wrap rounded-lg border border-border-muted bg-bg-primary px-4 py-3.5 text-sm leading-[1.6] text-text-primary [overflow-wrap:anywhere]">
          {item.message}
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span id="fb-status-label" className={LABEL}>
              Status
            </span>
            {item.status === "seen" && <span className={NOTE}>Seen · marked when you opened it</span>}
          </div>

          {answered ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={item.status} />
              </div>
              <span className={NOTE}>Answered. The status and the reply can&apos;t be changed.</span>
            </>
          ) : (
            <div role="radiogroup" aria-labelledby="fb-status-label" className="grid grid-cols-2 gap-2 md:max-w-[300px]">
              {CHOICES.map((k) => {
                const on = status === k;
                const style = STATUS_STYLE[k];
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      setStatus(k);
                      setError("");
                    }}
                    className={`inline-flex h-11 md:h-9 items-center justify-center gap-1.5 rounded-md border px-2 text-[13px] font-medium transition-colors ${
                      on
                        ? `border-transparent ${style.bg} ${style.fg}`
                        : "border-border-muted bg-bg-primary text-text-muted hover:bg-bg-hover hover:text-text-primary"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 flex-none rounded-full ${on ? style.dot : "bg-text-muted/50"}`} />
                    <span className="truncate">{STATUS_LABEL[k]}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="fb-reply" className={LABEL}>
              Reply
            </label>
            {!answered && <span className={NOTE}>{notPlanned ? "Required for Not planned" : "Optional"}</span>}
          </div>

          {answered ? (
            item.reply ? (
              <p className="m-0 whitespace-pre-wrap text-sm leading-[1.6] text-text-primary [overflow-wrap:anywhere]">{item.reply}</p>
            ) : (
              <span className="text-sm text-text-muted">No reply.</span>
            )
          ) : (
            <>
              <textarea
                id="fb-reply"
                value={reply}
                maxLength={FEEDBACK_REPLY_MAX}
                placeholder={notPlanned ? "Explain why this is not planned." : "Write a reply the user will see."}
                onChange={(e) => {
                  setReply(e.target.value);
                  if (e.target.value.trim()) setError("");
                }}
                aria-invalid={!!error}
                className={`${FIELD} dark-scrollbar min-h-[96px] max-h-[220px] px-3 py-2.5 resize-y ${error ? "border-[#f85149] ring-[3px] ring-[rgba(248,81,73,.15)]" : "border-border-muted"}`}
              />
              <div className="flex items-start justify-between gap-3">
                {error ? (
                  <span role="alert" className="flex items-start gap-1.5 text-[13px] text-[#ff7b72]">
                    <CircleAlert size={15} className="flex-none mt-0.5" />
                    <span>{error}</span>
                  </span>
                ) : (
                  <span className="text-[13px] text-text-muted">One status and one reply. You can&apos;t change them after saving.</span>
                )}
                <span className={`flex-none text-xs tabular-nums ${reply.length >= FEEDBACK_REPLY_MAX ? "text-[#ff7b72] font-semibold" : "text-text-muted"}`}>
                  {reply.length} / {FEEDBACK_REPLY_MAX}
                </span>
              </div>
            </>
          )}
        </div>

        {deleteInline}
      </div>

      <FooterRight>
        {answered && (
          <FbButton variant="ghostDanger" onClick={onAskDelete} className="mr-auto">
            <Trash2 size={16} />
            Delete
          </FbButton>
        )}
        {buttons}
      </FooterRight>
      <FooterSplit single={answered}>{buttons}</FooterSplit>
    </>
  );
}

// The admin's view of one message: who sent it, the message, the decision
// (Noted or Not planned) and one reply. `onSave(id, { status, reply })` resolves
// to an error text, or nothing when it worked. After saving, the message is
// answered for good; only Delete remains.
function AdminFeedbackDetails({ item, onClose, onSave, onAskDelete }) {
  if (!item) return null;
  return (
    <DetailsShell open type={item.type} onClose={onClose}>
      {/* Keyed on the message and its status, so the form restarts whenever a
          different message, or a new status after saving, is shown. */}
      <AdminBody
        key={`${item._id}-${item.status}`}
        item={item}
        onClose={onClose}
        onSave={onSave}
        onAskDelete={onAskDelete}
      />
    </DetailsShell>
  );
}

export default AdminFeedbackDetails;

// Used by: pages/AdminInbox.jsx.
