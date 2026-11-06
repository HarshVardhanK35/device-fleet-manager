import { useEffect, useState } from "react";
import { Filter, Inbox } from "lucide-react";

import {
  deleteInboxFeedback,
  getInboxFeedback,
  updateInboxFeedback,
} from "../api/feedback.js";
import { notifyFeedbackChanged } from "../hooks/useFeedbackIndicator.js";
import {
  INBOX_CHIPS,
  STATUS_LABEL,
  TYPE_LABEL,
  formatFeedbackDate,
  needsAttention,
} from "../utils/feedbackMeta.js";
import AdminFeedbackDetails from "../components/feedback/AdminFeedbackDetails.jsx";
import ConfirmDeleteFeedback from "../components/feedback/ConfirmDeleteFeedback.jsx";
import {
  ErrorIcon,
  FeedbackPager,
  FeedbackSkeleton,
  FeedbackStateBox,
} from "../components/feedback/FeedbackStates.jsx";
import RefreshButton from "../components/ui/RefreshButton.jsx";
import ClampedText from "../components/feedback/ClampedText.jsx";
import StatusBadge from "../components/feedback/StatusBadge.jsx";

const COLUMNS = "grid-cols-[minmax(0,1.6fr)_104px_minmax(0,2.4fr)_128px_112px]";

function senderOf(item) {
  const u = item.userId || {};
  return {
    fullName: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Deleted user",
    meta: u.username ? `@${u.username} · ${u.email || ""}` : u.email || "",
  };
}

function AttentionDot({ on }) {
  return <span className={`h-2 w-2 flex-none rounded-full ${on ? "bg-[#1f6feb]" : "bg-transparent"}`} />;
}

function TableRow({ item, onOpen }) {
  const s = senderOf(item);
  const attn = needsAttention(item.status);
  return (
    <div
      role="row"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
      aria-label={`${s.fullName}, ${STATUS_LABEL[item.status]}, ${formatFeedbackDate(item.createdAt)}`}
      className={`grid ${COLUMNS} min-h-16 cursor-pointer items-center gap-4 rounded-[10px] border border-transparent px-4 py-2 transition-[border-color,transform] duration-150 hover:translate-x-0.5 hover:border-border-muted ${
        attn ? "bg-[#0f1828]" : "bg-bg-panel"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <AttentionDot on={attn} />
        <div className="flex min-w-0 flex-col">
          <span className={`truncate text-sm ${attn ? "font-semibold" : "font-medium"} text-text-primary`}>{s.fullName}</span>
          <ClampedText as="span" text={s.meta} className="truncate text-xs text-text-muted" />
        </div>
      </div>
      <span className="text-[13px] text-text-primary">{TYPE_LABEL[item.type]}</span>
      <ClampedText
        as="span"
        text={item.message}
        className={`truncate text-[13px] ${attn ? "text-text-primary" : "text-text-muted"}`}
      />
      <span>
        <StatusBadge status={item.status} />
      </span>
      <span className="text-[13px] text-text-muted">{formatFeedbackDate(item.createdAt)}</span>
    </div>
  );
}

function InboxCard({ item, onOpen }) {
  const s = senderOf(item);
  const attn = needsAttention(item.status);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
      aria-label={`${s.fullName}, ${STATUS_LABEL[item.status]}, ${formatFeedbackDate(item.createdAt)}`}
      className={`flex cursor-pointer flex-col gap-1 rounded-[10px] border border-border-muted p-3.5 md:p-4 transition-colors ${
        attn ? "bg-[#0f1828]" : "bg-bg-panel"
      } hover:bg-[#1a2029]`}
    >
      <div className="flex items-center gap-2">
        <AttentionDot on={attn} />
        <span className={`min-w-0 flex-1 truncate text-sm ${attn ? "font-semibold" : "font-medium"} text-text-primary`}>{s.fullName}</span>
        <span className="flex-none text-xs text-text-muted">{formatFeedbackDate(item.createdAt)}</span>
      </div>
      <span className="truncate text-xs text-text-muted">{s.meta}</span>
      <ClampedText
        readMore
        text={item.message}
        className="m-0 line-clamp-2 text-sm text-text-primary [overflow-wrap:anywhere]"
      />
      <div className="flex items-center gap-2 pt-0.5 text-xs text-text-muted">
        <StatusBadge status={item.status} />
        {TYPE_LABEL[item.type]}
      </div>
    </div>
  );
}

function AdminInbox() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1, counts: { all: 0 } });
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getInboxFeedback({ status: filter === "all" ? "" : filter, page })
      .then((res) => {
        if (cancelled) return;
        if (!Array.isArray(res?.items)) throw new Error(res?.message || "Could not load");
        setData(res);
        setFailed(false);
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filter, page, reload]);

  const refetch = () => setReload((n) => n + 1);

  // The Refresh button: fetch the current list again (the button spins until it is back).
  async function refresh() {
    try {
      const res = await getInboxFeedback({ status: filter === "all" ? "" : filter, page });
      if (!Array.isArray(res?.items)) return;
      setData(res);
      setFailed(false);
      notifyFeedbackChanged();
    } catch {
      // keep what is on screen
    }
  }
  const counts = data.counts || { all: 0 };
  const openItem = data.items.find((i) => i._id === openId) || null;

  function retry() {
    setLoading(true);
    refetch();
  }

  function pickFilter(key) {
    setFilter(key);
    setPage(1);
  }

  // Opening a Sent message marks it Seen (the user's dot lights up for it).
  async function open(item) {
    setOpenId(item._id);
    if (item.status !== "sent") return;
    const res = await updateInboxFeedback(item._id, { status: "seen" });
    if (res?._id) {
      setData((d) => ({ ...d, items: d.items.map((i) => (i._id === res._id ? res : i)) }));
      refetch();
      notifyFeedbackChanged();
    }
  }

  // Resolves to an error text, or nothing when the save worked.
  async function save(id, change) {
    const res = await updateInboxFeedback(id, change);
    if (!res?._id) return res?.message || "Couldn't save. Try again.";
    setData((d) => ({ ...d, items: d.items.map((i) => (i._id === res._id ? res : i)) }));
    refetch();
    notifyFeedbackChanged();
    return "";
  }

  async function confirmDelete() {
    const res = await deleteInboxFeedback(deleteId);
    setDeleteId(null);
    if (res?.message !== "Feedback deleted") return;
    setOpenId(null);
    if (data.items.length === 1 && page > 1) setPage((p) => p - 1);
    refetch();
    notifyFeedbackChanged();
  }

  const chipLabel = INBOX_CHIPS.find((c) => c[0] === filter)?.[1] || "";

  return (
    <div>
      <div className="mb-4 flex min-h-9 items-center gap-3">
        <div className="flex min-w-0 flex-1 items-baseline gap-3">
          <h1 className="m-0 text-xl md:text-[22px] font-semibold tracking-tight text-text-primary">Inbox</h1>
          <span className="text-sm text-text-muted">
            {counts.all} {counts.all === 1 ? "message" : "messages"}
          </span>
        </div>
        <RefreshButton onRefresh={refresh} />
      </div>

      <div role="group" aria-label="Filter by status" className="scrollbar-hidden -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {INBOX_CHIPS.map(([key, label]) => {
          const on = filter === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => pickFilter(key)}
              className={`inline-flex h-11 md:h-[30px] flex-none items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium ${
                on
                  ? "border-[rgba(31,111,235,.6)] bg-[rgba(31,111,235,.16)] text-[#4493f8]"
                  : "border-border-muted text-text-primary"
              }`}
            >
              {label}
              <span className={`tabular-nums ${on ? "opacity-85" : "text-text-muted"}`}>{counts[key] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <FeedbackSkeleton narrow={false} />
      ) : failed ? (
        <FeedbackStateBox
          narrow={false}
          error
          icon={ErrorIcon}
          title="Couldn't load the inbox"
          hint="Check your connection and try again."
          action="Retry"
          onAction={retry}
        />
      ) : counts.all === 0 ? (
        <FeedbackStateBox narrow={false} icon={Inbox} title="Inbox is empty" hint="Messages from users will appear here." />
      ) : data.items.length === 0 ? (
        <FeedbackStateBox
          narrow={false}
          icon={Filter}
          title={`No ${chipLabel} messages`}
          hint="Nothing has this status right now."
          action="Show all"
          onAction={() => pickFilter("all")}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div role="table" aria-label="Messages" className="hidden lg:flex flex-col gap-1.5">
            <div role="row" className={`grid ${COLUMNS} gap-4 px-[17px] pb-2 text-xs text-text-muted`}>
              <span className="pl-[18px]">Sender</span>
              <span>Type</span>
              <span>Message</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {data.items.map((item) => (
              <TableRow key={item._id} item={item} onOpen={open} />
            ))}
          </div>
          <div className="flex flex-col gap-2.5 lg:hidden">
            {data.items.map((item) => (
              <InboxCard key={item._id} item={item} onOpen={open} />
            ))}
          </div>
          {data.pages > 1 && (
            <FeedbackPager narrow={false} page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          )}
        </div>
      )}

      <AdminFeedbackDetails
        item={openItem}
        onClose={() => setOpenId(null)}
        onSave={save}
        onAskDelete={() => setDeleteId(openItem?._id)}
      />
      <ConfirmDeleteFeedback admin open={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
}

export default AdminInbox;

// The admin's Inbox (/admin/inbox): every user's feedback with status chips
// and counts, 20 per page. Opening a Sent message marks it Seen; details hold
// the status control, the reply and Delete (once answered).
// Used by: App.jsx (AdminPage).
