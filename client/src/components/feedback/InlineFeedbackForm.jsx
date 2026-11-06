import { useFeedbackForm } from "../../hooks/useFeedbackForm.js";
import LoadingOverlay from "../loading/LoadingOverlay.jsx";
import FeedbackFields from "./FeedbackFields.jsx";
import { FbButton } from "./FeedbackButtons.jsx";

// The New feedback form as a card beside the message list, for desktop (xl and
// up), where there is room. Same fields and rules as the modal.
function InlineFeedbackForm({ remaining, limit, onSent }) {
  const form = useFeedbackForm({ remaining, limit, onSent });
  const hasDraft = !!form.type || !!form.message;

  return (
    <section className="rounded-xl border border-border-muted bg-bg-panel">
      <h2 className="m-0 px-5 pt-4 pb-1 text-[17px] font-semibold text-text-primary">New feedback</h2>
      <div className="px-5 pt-3 pb-5">
        <FeedbackFields form={form} id="fb-inline" />
      </div>
      <div className="flex items-center gap-2 border-t border-border-muted px-5 py-3">
        <span role="status" className="mr-auto text-[13px] text-text-muted">
          {form.justSent ? "Sent. Thank you." : ""}
        </span>
        {hasDraft && !form.blocked && (
          <FbButton onClick={form.reset} disabled={form.sending}>
            Clear
          </FbButton>
        )}
        <FbButton variant="primary" onClick={form.send} disabled={form.blocked || form.sending} className="md:px-[18px]">
          Send
        </FbButton>
      </div>
      <LoadingOverlay show={form.sending} />
    </section>
  );
}

export default InlineFeedbackForm;

// Used by: pages/Feedback.jsx.
