import { useEffect, useState } from "react";
import { MessageSquareText, Plus, Trash2 } from "lucide-react";

import { deleteMyFeedback, getMyFeedback, markFeedbackRead } from "../api/feedback.js";
import { notifyFeedbackChanged } from "../hooks/useFeedbackIndicator.js";
import { TYPE_LABEL, STATUS_LABEL, formatFeedbackDate } from "../utils/feedbackMeta.js";
import ConfirmDeleteFeedback from "../components/feedback/ConfirmDeleteFeedback.jsx";
import { FbButton } from "../components/feedback/FeedbackButtons.jsx";
import {
  ErrorIcon,
  FeedbackPager,
  FeedbackSkeleton,
  FeedbackStateBox,
} from "../components/feedback/FeedbackStates.jsx";
import NewFeedbackModal from "../components/feedback/NewFeedbackModal.jsx";
import StatusBadge from "../components/feedback/StatusBadge.jsx";
import UserFeedbackDetails from "../components/feedback/UserFeedbackDetails.jsx";

function FeedbackCard({ item, onOpen, onAskDelete }) {
  return (
    <article
      tabIndex={0}
      onClick={() => onOpen(item._id)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen(item._id);
        }
      }}
      aria-label={`${TYPE_LABEL[item.type]}, ${STATUS_LABEL[item.status]}, ${formatFeedbackDate(item.createdAt)}${item.userUnread ? ", updated" : ""}`}
      className="flex cursor-pointer flex-col gap-2.5 rounded-[10px] border border-border-muted bg-bg-panel p-3.5 md:p-4 md:px-[18px] transition-colors duration-150 hover:bg-[#1a2029]"
    >
      <div className="flex min-h-6 items-center gap-2">
        <span className="text-[13px] font-medium text-text-primary">{TYPE_LABEL[item.type]}</span>
        {item.userUnread && (
          <span className="inline-flex h-5 items-center rounded-full bg-[rgba(31,111,235,.16)] px-[7px] text-[11px] font-semibold text-[#4493f8]">
            Updated
          </span>
        )}
        <span className="ml-auto">
          <StatusBadge status={item.status} />
        </span>
        {item.status === "sent" && (
          <button
            type="button"
            aria-label="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onAskDelete(item._id);
            }}
            className="-my-2.5 grid h-11 w-11 md:h-8 md:w-8 md:-my-1 flex-none place-items-center rounded-md text-text-muted transition-colors hover:bg-bg-hover hover:text-[#ff7b72]"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>
      <p className="m-0 line-clamp-3 text-sm leading-[1.55] text-text-primary [overflow-wrap:anywhere]">{item.message}</p>
      {item.reply && (
        <div className="flex flex-col gap-[3px] rounded-lg bg-bg-primary px-3 py-2.5">
          <span className="text-xs font-medium text-text-muted">Reply from admin</span>
          <span className="text-sm text-text-primary [overflow-wrap:anywhere]">{item.reply}</span>
        </div>
      )}
      <span className="text-xs text-text-muted">{formatFeedbackDate(item.createdAt)}</span>
    </article>
  );
}

function Feedback() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1, remaining: 0, limit: 5 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [newOpen, setNewOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch the page; again whenever `reload` is bumped (sent, deleted, Retry).
  useEffect(() => {
    let cancelled = false;
    getMyFeedback({ page })
      .then((res) => {
        if (cancelled) return;
        if (!Array.isArray(res?.items)) throw new Error(res?.message || "Could not load");
        setData(res);
        setFailed(false);
        // The user has now seen anything the admin changed: clear the red dot.
        if (res.items.some((i) => i.userUnread)) {
          markFeedbackRead()
            .then(notifyFeedbackChanged)
            .catch(() => {});
        }
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, reload]);

  const refetch = () => setReload((n) => n + 1);
  const openItem = data.items.find((i) => i._id === openId) || null;

  function retry() {
    setLoading(true);
    refetch();
  }

  function onSent() {
    setNewOpen(false);
    setPage(1);
    refetch();
  }

  async function confirmDelete() {
    const res = await deleteMyFeedback(deleteId);
    if (res?.message !== "Feedback deleted") {
      setDeleteId(null);
      return;
    }
    setDeleteId(null);
    setOpenId(null);
    if (data.items.length === 1 && page > 1) setPage((p) => p - 1);
    refetch();
    notifyFeedbackChanged();
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-5 flex min-h-9 items-center gap-3">
        <h1 className="m-0 flex-1 text-xl md:text-[22px] font-semibold tracking-tight text-text-primary">Feedback</h1>
        <FbButton variant="primary" onClick={() => setNewOpen(true)} className="!pl-3">
          <Plus size={16} />
          New feedback
        </FbButton>
      </div>

      {loading ? (
        <FeedbackSkeleton />
      ) : failed ? (
        <FeedbackStateBox
          error
          icon={ErrorIcon}
          title="Couldn't load your feedback"
          hint="Check your connection and try again."
          action="Retry"
          onAction={retry}
        />
      ) : data.items.length === 0 ? (
        <FeedbackStateBox
          icon={MessageSquareText}
          title="No feedback yet"
          hint="Found a problem or have an idea? Use New feedback. Your messages and their replies will show up here."
        />
      ) : (
        <div className="flex max-w-[860px] flex-col gap-4">
          <div className="flex flex-col gap-3">
            {data.items.map((item) => (
              <FeedbackCard key={item._id} item={item} onOpen={setOpenId} onAskDelete={setDeleteId} />
            ))}
          </div>
          {data.pages > 1 && <FeedbackPager page={data.page} pages={data.pages} total={data.total} onPage={setPage} />}
        </div>
      )}

      <NewFeedbackModal
        open={newOpen}
        onOpenChange={setNewOpen}
        remaining={data.remaining}
        limit={data.limit}
        onSent={onSent}
      />
      <UserFeedbackDetails item={openItem} onClose={() => setOpenId(null)} onAskDelete={() => setDeleteId(openItem?._id)} />
      <ConfirmDeleteFeedback open={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
}

export default Feedback;

// The user's Feedback page (/feedback): their own messages with status and the
// admin's reply, New feedback, and delete while a message is still Sent.
// Opening the page clears the red dot. Used by: App.jsx.
