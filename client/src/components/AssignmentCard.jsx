import { AlertTriangle, ArrowRight, Pencil, Trash2 } from "lucide-react";

import ActionMenu from "./ActionMenu.jsx";
import {
  getAssignmentStatus,
  STATUS_PILL,
} from "../utils/assignmentStatus.js";
import {
  formatDuration,
  formatClock,
  formatDateLabel,
} from "../utils/scheduleTime.js";

function AssignmentCard({ assignment, device, onDeleteRequest }) {
  const status = getAssignmentStatus(assignment, device);
  const pill = STATUS_PILL[status];

  const begin = new Date(assignment.beginDT);
  const end = new Date(assignment.endDT);
  const now = new Date();
  const percent =
    status === "live"
      ? Math.min(100, Math.max(0, ((now - begin) / (end - begin)) * 100))
      : 0;

  return (
    <div className="bg-bg-primary rounded-lg p-4 border border-border-muted hover:border-border-hover transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${pill.className}`}
        >
          {pill.label}
        </span>
        <ActionMenu
          label={`More actions for ${assignment.playlistId?.name ?? "assignment"}`}
          items={[
            {
              label: "Edit",
              icon: Pencil,
              disabled: true, // no edit UI built yet — stubbed, not wired
              onClick: () => {},
            },
            { type: "separator" },
            {
              label: "Delete",
              icon: Trash2,
              variant: "danger",
              onClick: () => onDeleteRequest(assignment),
            },
          ]}
        />
      </div>

      <p className="text-text-primary font-bold mb-3">
        {assignment.playlistId?.name ?? "Unknown playlist"}
      </p>

      <div className="flex items-center gap-4 mb-3">
        <div>
          <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide">
            Begins
          </p>
          <p className="text-text-primary font-bold">{formatClock(begin)}</p>
          <p className="text-text-muted text-xs">{formatDateLabel(begin)}</p>
        </div>
        <ArrowRight size={16} className="text-text-muted mt-3 shrink-0" />
        <div>
          <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide">
            Ends
          </p>
          <p className="text-text-primary font-bold">{formatClock(end)}</p>
          <p className="text-text-muted text-xs">{formatDateLabel(end)}</p>
        </div>
      </div>

      {status === "live" && (
        <>
          <div className="w-full h-1.5 bg-bg-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-green rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-text-muted text-xs">
              {formatDuration(end - now)} left
            </span>
            <span className="text-text-muted text-xs">
              {formatDuration(end - begin)} total
            </span>
          </div>
        </>
      )}

      {status === "upcoming" && (
        <p className="text-text-muted text-xs">
          Starts in {formatDuration(begin - now)} · runs{" "}
          {formatDuration(end - begin)}
        </p>
      )}

      {status === "paused" && (
        <div className="flex items-start gap-2 bg-accent-amber/10 border border-accent-amber/30 text-accent-amber text-xs rounded px-3 py-2 mt-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          This screen is offline, so it's still showing its last-received
          content instead of this playlist. It will pick up this playlist
          when it reconnects.
        </div>
      )}
    </div>
  );
}

export default AssignmentCard;

// Renders a single assignment's schedule card: status pill (Live/Upcoming/
// Ended/paused-offline), playlist name, Begins/Ends times, a live progress
// bar for active assignments, and an ActionMenu (Edit — stubbed, Delete —
// wired) for managing it. Status/timing logic comes from
// utils/assignmentStatus.js and utils/scheduleTime.js.
// Used by: pages/Assignments.jsx.
