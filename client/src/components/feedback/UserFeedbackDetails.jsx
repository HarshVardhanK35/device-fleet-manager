import { Trash2 } from "lucide-react";

import { STATUS_EXPLAIN } from "../../utils/feedbackMeta.js";
import ScrollBox from "../layout/ScrollBox.jsx";
import DetailsShell from "./DetailsShell.jsx";
import StatusBadge from "./StatusBadge.jsx";
import { FbButton, FooterRight, FooterSplit } from "./FeedbackButtons.jsx";

const CAPTION = "text-xs font-medium text-text-muted";

// The user's view of one of their messages: status, their message and the
// admin's reply. Delete is offered only while the message is still Sent.
function UserFeedbackDetails({ item, onClose, onAskDelete }) {
  if (!item) return null;
  const canDelete = item.status === "sent";

  return (
    <DetailsShell open type={item.type} onClose={onClose}>
      <ScrollBox>
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col items-start gap-2 rounded-[10px] border border-border-muted bg-bg-primary px-4 py-3.5">
          <span className={CAPTION}>Status</span>
          <StatusBadge status={item.status} large />
          <span className="text-sm text-text-muted">{STATUS_EXPLAIN[item.status]}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={CAPTION}>Your message</span>
          <p className="m-0 whitespace-pre-wrap text-sm leading-[1.6] text-text-primary [overflow-wrap:anywhere]">{item.message}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={CAPTION}>Reply from admin</span>
          {item.reply ? (
            <p className="m-0 whitespace-pre-wrap text-sm leading-[1.6] text-text-primary [overflow-wrap:anywhere]">{item.reply}</p>
          ) : (
            <span className="text-sm text-text-muted">No reply yet.</span>
          )}
        </div>

        {canDelete && (
          <FbButton variant="ghostDanger" onClick={onAskDelete} className="md:hidden self-start -ml-3.5">
            <Trash2 size={17} />
            Delete message
          </FbButton>
        )}
      </div>
      </ScrollBox>

      <FooterRight>
        {canDelete && (
          <FbButton variant="ghostDanger" onClick={onAskDelete} className="mr-auto">
            <Trash2 size={16} />
            Delete
          </FbButton>
        )}
        <FbButton onClick={onClose}>Close</FbButton>
      </FooterRight>
      <FooterSplit single>
        <FbButton onClick={onClose}>Close</FbButton>
      </FooterSplit>
    </DetailsShell>
  );
}

export default UserFeedbackDetails;

// Used by: pages/Feedback.jsx.
