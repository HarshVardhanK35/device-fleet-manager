import { ChevronLeft, ChevronRight, CircleAlert, RotateCw } from "lucide-react";

import { FbButton } from "./FeedbackButtons.jsx";

// The loading, empty and error pieces and the pager both Feedback pages share.

// Static grey cards while a page loads (no shimmer).
export function FeedbackSkeleton({ narrow = true }) {
  const widths = [92, 70, 84, 60, 78];
  return (
    <div className={`flex flex-col gap-3 ${narrow ? "max-w-[860px]" : ""}`} aria-label="Loading">
      {widths.map((w, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-[10px] border border-border-muted bg-bg-panel p-[18px]">
          <div className="flex items-center justify-between gap-2.5">
            <span className="h-3 w-[72px] rounded bg-border-muted/70" />
            <span className="h-5 w-[76px] rounded-full bg-border-muted/70" />
          </div>
          <span className="h-3 rounded bg-border-muted/70" style={{ width: `${w}%` }} />
          <span className="h-3 rounded bg-border-muted/70" style={{ width: `${w * 0.55}%` }} />
        </div>
      ))}
    </div>
  );
}

// A dashed box: empty, no results or an error with Retry.
export function FeedbackStateBox({ icon: Icon, error = false, title, hint, action, onAction, narrow = true }) {
  return (
    <div
      className={`flex flex-col items-center gap-3.5 rounded-xl border border-dashed border-border-muted px-5 py-12 md:px-6 md:py-16 text-center ${
        narrow ? "max-w-[860px]" : ""
      }`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-[10px] border border-border-muted bg-bg-panel">
        <Icon size={20} className={error ? "text-[#ff7b72]" : "text-text-muted"} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="m-0 text-base font-semibold text-text-primary [overflow-wrap:anywhere]">{title}</h2>
        <p className="m-0 max-w-[380px] text-sm text-text-muted">{hint}</p>
      </div>
      {action && (
        <FbButton onClick={onAction}>
          {error && <RotateCw size={15} />}
          {action}
        </FbButton>
      )}
    </div>
  );
}

export const ErrorIcon = CircleAlert;

// "21–40 of 87" with Prev / Next.
export function FeedbackPager({ page, pages, total, pageSize = 20, onPage, narrow = true }) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className={`flex items-center gap-2 ${narrow ? "max-w-[860px]" : ""}`}>
      <span className="mr-auto text-[13px] text-text-muted">
        {from}–{to} of {total}
      </span>
      <FbButton onClick={() => onPage(page - 1)} disabled={page <= 1} className="!pl-2 !pr-3">
        <ChevronLeft size={16} />
        Prev
      </FbButton>
      <FbButton onClick={() => onPage(page + 1)} disabled={page >= pages} className="!pl-3 !pr-2">
        Next
        <ChevronRight size={16} />
      </FbButton>
    </div>
  );
}

// Used by: pages/Feedback.jsx, pages/AdminInbox.jsx.
