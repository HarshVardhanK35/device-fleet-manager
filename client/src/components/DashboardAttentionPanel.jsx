import { useState } from "react";
import {
  TriangleAlert,
  CheckCircle2,
  WifiOff,
  CalendarOff,
  Filter,
} from "lucide-react";

import StyledSelect from "./StyledSelect.jsx";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "off", label: "Offline" },
  { value: "idle", label: "Nothing playing" },
];

function AttentionRow({ item }) {
  const offline = item.kind === "off";
  const Icon = offline ? WifiOff : CalendarOff;
  const tone = offline
    ? "text-accent-red bg-accent-red/15"
    : "text-accent-amber bg-accent-amber/15";

  return (
    <div className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_150px] items-center gap-3 md:gap-3.5 px-4 py-3 border-b border-border-muted last:border-b-0">
      <span
        className={`w-8 h-8 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-none ${tone}`}
      >
        <Icon size={16} />
      </span>

      <div className="min-w-0 flex flex-col gap-0.5">
        <div className="font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
          {item.device.name}
        </div>
        <div className="md:hidden flex items-center gap-1.5 text-xs text-text-muted min-w-0">
          <span className={offline ? "text-accent-red" : "text-accent-amber"}>
            {offline ? "Offline" : "Nothing playing"}
          </span>
          <span>·</span>
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {item.since}
          </span>
        </div>
        <div className="hidden md:block text-xs text-text-muted whitespace-nowrap overflow-hidden text-ellipsis">
          {item.device.type}
        </div>
      </div>

      <div className="hidden md:flex flex-col gap-0.5">
        <span
          className={`self-start inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11.5px] font-medium ${tone}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${offline ? "bg-accent-red" : "bg-accent-amber"}`}
          />
          {offline ? "Offline" : "Nothing playing"}
        </span>
        <span className="text-text-muted text-xs">{item.reason}</span>
      </div>
    </div>
  );
}

function DashboardAttentionPanel({ items, onOpenAssignments }) {
  const [filter, setFilter] = useState("all");

  const filtered = items.filter((i) => filter === "all" || i.kind === filter);

  const hasIssues = items.length > 0;

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
          Needs attention
        </span>
        <span className={countPillClass}>
          {items.length}
        </span>

        <div className="ml-auto">
          <StyledSelect
            value={filter}
            onChange={setFilter}
            options={FILTER_OPTIONS}
            icon={Filter}
            label="Filter devices"
          />
        </div>
      </div>

      {hasIssues ? (
        <>
          <div className="flex flex-col">
            {filtered.map((item) => (
              <AttentionRow key={item.device._id} item={item} />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs text-text-muted">
            Sorted by longest affected first
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
            Nothing needs attention
          </div>
          <p className="text-text-muted text-sm m-0">
            All devices are online and have something scheduled.
          </p>
        </div>
      )}
    </div>
  );
}

export default DashboardAttentionPanel;

// Dashboard's "Needs attention" panel: devices that are offline, or online
// with nothing currently scheduled ("idle"). Filter dropdown (All /
// Offline / Nothing playing) reuses the same StyledSelect component as
// the Content page's Filter control, instead of a bespoke segmented
// toggle — no per-option counts shown, just the plain labels. Red-tinted
// header/border signal severity; empty state shows when nothing needs
// attention.
// `items` is [{ device, kind: "off" | "idle", reason, since }] — caller
// computes this from devices + assignments (see Dashboard.jsx). Rows are
// informational only (no per-row action/link) — Assignments.jsx has no
// deep-link support for pre-selecting a device, so a "View device" button
// here could only ever land on whichever device Assignments picks first,
// not the one actually clicked; `onOpenAssignments` (the footer link) is
// the only navigation this panel offers, and it's honest about just going
// to Assignments generically.
// Used by: pages/Dashboard.jsx.
