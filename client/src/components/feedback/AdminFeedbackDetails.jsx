import { useState } from "react";
import { ChevronDown, CircleAlert, Trash2 } from "lucide-react";

import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import {
  FEEDBACK_REPLY_MAX,
  STATUS_LABEL,
  STATUS_STYLE,
  formatFeedbackDateTime,
} from "../../utils/feedbackMeta.js";
import DetailsShell from "./DetailsShell.jsx";
import { FbButton, FooterRight, FooterSplit } from "./FeedbackButtons.jsx";

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
  const [status, setStatus] = useState(item.status);
  const [reply, setReply] = useState(item.reply || "");
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const from = sender(item);
  const notPlanned = status === "not-planned";
  const canDelete = item.status === "done" || item.status === "not-planned";

  const [save, saving] = useAsyncAction(async () => {
    if (notPlanned && !reply.trim()) {
      setError(true);
      setSaved(false);
      return;
    }
    setServerErr("");
    const problem = await onSave(item._id, { status, reply: reply.trim() });
    if (problem) setServerErr(problem);
    else setSaved(true);
  });

  const dot = (STATUS_STYLE[status] || STATUS_STYLE.sent).dot;
  const deleteInline = canDelete && (
    <FbButton variant="ghostDanger" onClick={onAskDelete} className="md:hidden self-start -ml-3.5">
      <Trash2 size={17} />
      Delete message
    </FbButton>
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
            <label htmlFor="fb-status" className={LABEL}>
              Status
            </label>
            {status === "seen" && <span className={NOTE}>Seen · marked when you opened it</span>}
          </div>
          <span className="relative block md:max-w-[280px]">
            <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${dot}`} />
            <select
              id="fb-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setError(false);
                setSaved(false);
              }}
              className={`${FIELD} appearance-none h-11 md:h-9 pl-[26px] pr-9 border-border-muted`}
            >
              {status === "seen" && (
                <option value="seen" disabled>
                  {STATUS_LABEL.seen}
                </option>
              )}
              {["in-progress", "done", "not-planned"].map((k) => (
                <option key={k} value={k}>
                  {STATUS_LABEL[k]}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="fb-reply" className={LABEL}>
              Reply
            </label>
            <span className={NOTE}>{notPlanned ? "Required for Not planned" : "Optional"}</span>
          </div>
          <textarea
            id="fb-reply"
            value={reply}
            maxLength={FEEDBACK_REPLY_MAX}
            placeholder={notPlanned ? "Explain why this is not planned." : "Write a reply the user will see."}
            onChange={(e) => {
              setReply(e.target.value);
              setSaved(false);
              if (e.target.value.trim()) setError(false);
            }}
            aria-invalid={error}
            className={`${FIELD} min-h-[96px] px-3 py-2.5 resize-y ${error ? "border-[#f85149] ring-[3px] ring-[rgba(248,81,73,.15)]" : "border-border-muted"}`}
          />
          <div className="flex items-start justify-between gap-3">
            {error ? (
              <span role="alert" className="flex items-start gap-1.5 text-[13px] text-[#ff7b72]">
                <CircleAlert size={15} className="flex-none mt-0.5" />
                <span>Add a reason to save as Not planned. The user sees it with the status.</span>
              </span>
            ) : (
              <span className="text-[13px] text-text-muted">
                {notPlanned ? "The user sees this as the reason." : "The user sees your reply next to the status."}
              </span>
            )}
            <span className={`flex-none text-xs tabular-nums ${reply.length >= FEEDBACK_REPLY_MAX ? "text-[#ff7b72] font-semibold" : "text-text-muted"}`}>
              {reply.length} / {FEEDBACK_REPLY_MAX}
            </span>
          </div>
          {serverErr && (
            <span role="alert" className="text-[13px] text-[#ff7b72]">
              {serverErr}
            </span>
          )}
        </div>

        {deleteInline}
      </div>

      <FooterRight>
        {canDelete && (
          <FbButton variant="ghostDanger" onClick={onAskDelete}>
            <Trash2 size={16} />
            Delete
          </FbButton>
        )}
        <span role="status" className="mr-auto pl-1 text-[13px] text-text-muted">
          {saved ? "Saved" : ""}
        </span>
        <FbButton onClick={onClose}>Cancel</FbButton>
        <FbButton variant="primary" onClick={save} disabled={saving} className="md:px-4">
          {saving ? "Saving…" : "Save"}
        </FbButton>
      </FooterRight>
      <FooterSplit>
        <FbButton onClick={onClose}>Close</FbButton>
        <FbButton variant="primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </FbButton>
      </FooterSplit>
    </>
  );
}

// The admin's view of one message: who sent it, the message, a status control
// and a reply box. `onSave(id, { status, reply })` resolves to an error text, or
// nothing when it worked. Not planned needs a reply (the reason the user sees).
function AdminFeedbackDetails({ item, onClose, onSave, onAskDelete }) {
  if (!item) return null;
  return (
    <DetailsShell open type={item.type} onClose={onClose}>
      {/* Keyed so the form restarts when a different message (or a refreshed
          copy after saving) is shown. */}
      <AdminBody key={item._id} item={item} onClose={onClose} onSave={onSave} onAskDelete={onAskDelete} />
    </DetailsShell>
  );
}

export default AdminFeedbackDetails;

// Used by: pages/AdminInbox.jsx.
