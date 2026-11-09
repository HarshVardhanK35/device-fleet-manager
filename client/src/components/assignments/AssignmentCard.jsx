import { AlertTriangle, ArrowRight, Pencil, Square, Trash2 } from "lucide-react";
import LoadingOverlay from "../loading/LoadingOverlay.jsx";

import ActionMenu from "../ui/ActionMenu.jsx";
import AssignmentPlaylistPreview, { AssignmentPlaylistLine } from "./AssignmentPlaylistPreview.jsx";
import {
  getAssignmentStatus,
  STATUS_PILL,
} from "../../utils/assignments/assignmentStatus.js";
import {
  formatScheduleDuration,
  formatClock,
  formatDateLabel,
  formatAutoDeleteNotice,
} from "../../utils/assignments/scheduleTime.js";

// Live and paused (offline-missed) both occupy the "current" slot for
// this device right now, so they share the same menu rules as Live.
function getMenuForStatus(status, { onEdit, onStop, onDelete }) {
  if (status === "live" || status === "paused") {
    return {
      items: [
        { label: "Stop now", icon: Square, variant: "danger", onClick: onStop },
      ],
      footer: "Live assignments can't be edited or deleted.",
    };
  }
  if (status === "upcoming") {
    return {
      items: [
        { label: "Edit", icon: Pencil, onClick: onEdit },
        { type: "separator" },
        { label: "Delete", icon: Trash2, variant: "danger", onClick: onDelete },
      ],
      footer: null,
    };
  }
  // ended
  return {
    items: [{ label: "Delete", icon: Trash2, variant: "danger", onClick: onDelete }],
    footer: "Ended assignments are read-only.",
  };
}

function AssignmentCard({
  assignment,
  device,
  onDeleteRequest,
  onEditRequest,
  onStopRequest,
  stopping = false,
}) {
  const status = getAssignmentStatus(assignment, device);
  const pill = STATUS_PILL[status];
  const menu = getMenuForStatus(status, {
    onEdit: () => onEditRequest(assignment),
    onStop: () => onStopRequest(assignment),
    onDelete: () => onDeleteRequest(assignment),
  });

  const begin = new Date(assignment.beginDT);
  const end = new Date(assignment.endDT);
  const now = new Date();
  const percent =
    status === "live"
      ? Math.min(100, Math.max(0, ((now - begin) / (end - begin)) * 100))
      : 0;

  return (
    <div className="@container bg-bg-primary rounded-lg p-4 border border-border-muted hover:border-border-hover transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${pill.className}`}
        >
          {stopping ? "Stopping…" : pill.label}
        </span>
        <LoadingOverlay show={stopping} />
        <ActionMenu
          label={`More actions for ${assignment.playlistId?.name ?? "assignment"}`}
          items={menu.items}
          footer={menu.footer}
        />
      </div>

      <div className="@2xl:flex @2xl:gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-text-primary font-bold mb-3">
            {assignment.playlistId?.name ?? "Unknown playlist"}
          </p>

          <div className="flex items-center gap-2 sm:gap-4 mb-3">
            <div>
              <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide">
                Begins
              </p>
              <p className="text-text-primary font-bold">{formatClock(begin)}</p>
              <p className="text-text-muted text-xs whitespace-nowrap">{formatDateLabel(begin)}</p>
            </div>
            <ArrowRight size={16} className="text-text-muted mt-3 shrink-0" />
            <div>
              <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide">
                Ends
              </p>
              <p className="text-text-primary font-bold">{formatClock(end)}</p>
              <p className="text-text-muted text-xs whitespace-nowrap">{formatDateLabel(end)}</p>
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
                  {formatScheduleDuration(end - now)} left
                </span>
                <span className="text-text-muted text-xs">
                  {formatScheduleDuration(end - begin)} total
                </span>
              </div>
            </>
          )}

          {status === "upcoming" && (
            <p className="text-text-muted text-xs">
              Starts in {formatScheduleDuration(begin - now)} · runs{" "}
              {formatScheduleDuration(end - begin)}
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

          {status === "ended" && (
            <p className="text-text-muted text-xs mt-2">
              {formatAutoDeleteNotice(assignment.endDT)}
            </p>
          )}

          <AssignmentPlaylistLine playlist={assignment.playlistId} />
        </div>
        <AssignmentPlaylistPreview playlist={assignment.playlistId} />
      </div>
    </div>
  );
}

export default AssignmentCard;

// Renders a single assignment's schedule card: status pill (Live/Upcoming/
// Ended/paused-offline), playlist name, Begins/Ends times, a live progress
// bar for active assignments, and a status-aware ActionMenu — Live/paused
// get "Stop now" only, Upcoming gets Edit+Delete, Ended gets Delete only
// (matches Assignment-Menu-Reference.html exactly; paused is treated like
// live since it's still occupying the device's current time slot).
// Status/timing logic comes from utils/assignments/assignmentStatus.js and
// utils/assignments/scheduleTime.js.
// Used by: pages/Assignments.jsx.
