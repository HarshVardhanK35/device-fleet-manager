import { useState } from "react";
import {
  TriangleAlert,
  CheckCircle2,
  WifiOff,
  CalendarOff,
  MonitorPlay,
  Filter,
} from "lucide-react";

import StyledSelect from "../ui/StyledSelect.jsx";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "ok", label: "Playing" },
  { value: "off", label: "Offline" },
  { value: "idle", label: "Nothing playing" },
];

function AttentionRow({ item }) {
  const KIND = {
    off: { Icon: WifiOff, label: "Offline", tone: "text-accent-red bg-accent-red/15", dot: "bg-accent-red" },
    idle: { Icon: CalendarOff, label: "Nothing playing", tone: "text-accent-amber bg-accent-amber/15", dot: "bg-accent-amber" },
    ok: { Icon: MonitorPlay, label: "Playing", tone: "text-accent-green bg-accent-green/15", dot: "bg-accent-green" },
  }[item.kind];
  const { Icon, tone } = KIND;

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-3.5 px-4 py-3 border-b border-border-muted last:border-b-0">
      <span
        className={`w-8 h-8 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-none ${tone}`}
      >
        <Icon size={16} />
      </span>

      <div className="min-w-0 flex flex-col gap-0.5">
        <div className="font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
          {item.device.name}
        </div>
        <div className="hidden md:block text-xs text-text-muted whitespace-nowrap overflow-hidden text-ellipsis">
          {item.device.type}
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <span
          className={`self-end inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11.5px] font-medium ${tone}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${KIND.dot}`}
          />
          {KIND.label}
        </span>
        <span className="text-text-muted text-xs text-right whitespace-nowrap">
          <span className="md:hidden">{item.kind === "ok" ? item.reason : item.since}</span>
          <span className="hidden md:inline">{item.reason}</span>
        </span>
      </div>
    </div>
  );
}

function DashboardAttentionPanel({ items, onOpenAssignments }) {
  const [filter, setFilter] = useState("all");

  const filtered = items.filter((i) => filter === "all" || i.kind === filter);

  const issueCount = items.filter((i) => i.kind !== "ok").length;
  const hasIssues = issueCount > 0;

  // Full literal class strings per branch (not string-interpolated) since
  // Tailwind's scanner needs to see each class name written out to
  // generate it — a `bg-accent-${tone}/15`-style template wouldn't exist
  // in the compiled CSS.
  const panelClass = hasIssues
    ? "bg-bg-panel border border-accent-red/30 rounded-xl overflow-hidden"
    : "bg-bg-panel border border-accent-green/30 rounded-xl overflow-hidden";
  const headerClass = hasIssues
    ? "flex flex-wrap items-center gap-2.5 px-4 py-3.5 bg-accent-red/[0.06] border-b border-border-muted"
    : "flex flex-wrap items-center gap-2.5 px-4 py-3.5 bg-accent-green/[0.06] border-b border-border-muted";
  const iconBadgeClass = hasIssues
    ? "w-7 h-7 rounded-lg bg-accent-red/15 text-accent-red flex items-center justify-center flex-none"
    : "w-7 h-7 rounded-lg bg-accent-green/15 text-accent-green flex items-center justify-center flex-none";
  const countPillClass = hasIssues
    ? "px-2 py-0.5 rounded-full text-xs font-semibold bg-accent-red/15 text-accent-red"
    : "px-2 py-0.5 rounded-full text-xs font-semibold bg-accent-green/15 text-accent-green";

  return (
    <div className={panelClass}>
      <div className={headerClass}>
        <span className={iconBadgeClass}>
          {hasIssues ? <TriangleAlert size={15} /> : <CheckCircle2 size={15} />}
        </span>
        <span className="font-semibold text-[15px] text-text-primary">
          Screens
        </span>
        <span className={countPillClass}>
          {hasIssues ? `${issueCount} need attention` : "All good"}
        </span>

        <div className="ml-auto">
          <StyledSelect
            value={filter}
            onChange={setFilter}
            options={FILTER_OPTIONS}
            icon={Filter}
            label="Filter devices"
            align="end"
          />
        </div>
      </div>

      {items.length > 0 ? (
        <>
          <div className="flex flex-col">
            {filtered.map((item) => (
              <AttentionRow key={item.device._id} item={item} />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs text-text-muted">
            Playing first, offline last
            <button
              onClick={onOpenAssignments}
              className="text-accent-blue font-medium hover:underline"
            >
              Open in Assignments →
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center text-center gap-2 py-10 px-4">
          <span className="w-11 h-11 rounded-full bg-accent-green/15 text-accent-green flex items-center justify-center">
            <CheckCircle2 size={22} />
          </span>
          <div className="font-semibold text-[15px] text-text-primary">
            No screens yet
          </div>
          <p className="text-text-muted text-sm m-0">
            Pair a screen from the Screens page and it will show up here.
          </p>
        </div>
      )}
    </div>
  );
}

export default DashboardAttentionPanel;

// Dashboard's "Screens" panel: EVERY screen — offline (red), online with
// nothing scheduled (amber), and playing (green) — problems first. Filter dropdown (All /
// Offline / Nothing playing) reuses the same StyledSelect component as
// the Content page's Filter control, instead of a bespoke segmented
// toggle — no per-option counts shown, just the plain labels. Red-tinted
// header/border signal severity; empty state shows when nothing needs
// attention.
// `items` is [{ device, kind: "off" | "idle" | "ok", reason, since }] — caller
// computes this from devices + assignments (see Dashboard.jsx). Rows are
// informational only (no per-row action/link) — Assignments.jsx has no
// deep-link support for pre-selecting a device, so a "View device" button
// here could only ever land on whichever device Assignments picks first,
// not the one actually clicked; `onOpenAssignments` (the footer link) is
// the only navigation this panel offers, and it's honest about just going
// to Assignments generically.
// Used by: pages/Dashboard.jsx.
