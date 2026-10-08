import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import {
  ListVideo,
  ChevronDown,
  Check,
  TriangleAlert,
  Send,
} from "lucide-react";

import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../api/assignments.js";
import {
  findConflict,
  classifyOverride,
  overlapRange,
} from "../utils/publishConflicts.js";
import { getAssignmentStatus, STATUS_PILL } from "../utils/assignmentStatus.js";
import { formatDuration } from "../utils/scheduleTime.js";
import { timeAgo } from "../utils/timeAgo.js";
import SelectCheckbox from "./SelectCheckbox.jsx";
import CancelButton from "./CancelButton.jsx";
import Button from "./Button.jsx";
import ScrollBox from "./ScrollBox.jsx";
import DateTimeField from "./DateTimeField.jsx";

function pad(n) {
  return String(n).padStart(2, "0");
}

function toLocalInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatRange(begin, end) {
  const sameDay = begin.toDateString() === end.toDateString();
  const dateFmt = (d) =>
    d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const timeFmt = (d) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return sameDay
    ? `${dateFmt(begin)} ${timeFmt(begin)} – ${timeFmt(end)}`
    : `${dateFmt(begin)} ${timeFmt(begin)} – ${dateFmt(end)} ${timeFmt(end)}`;
}

function playlistMeta(playlist) {
  const count = playlist.contentItems?.length ?? 0;
  const totalMs = (playlist.contentItems || []).reduce(
    (sum, c) => sum + (c.durationInMillis || 0),
    0,
  );
  return `${count} item${count === 1 ? "" : "s"} · ${formatDuration(totalMs)} loop`;
}

function PlaylistSelectField({ playlists, value, onChange }) {
  const selected = playlists.find((p) => p._id === value);
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="group w-full flex items-center gap-3 bg-bg-primary border border-border-muted hover:border-border-hover rounded-lg px-3 py-2.5 text-left outline-none transition-colors focus-visible:border-accent-blue data-[state=open]:border-accent-blue">
        <span className="w-9 h-9 rounded-lg bg-accent-blue/15 text-accent-blue flex items-center justify-center flex-none">
          <ListVideo size={18} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-text-primary font-semibold text-sm truncate">
            {selected ? selected.name : "Select a playlist"}
          </span>
          {selected && (
            <span className="block text-text-muted text-xs">
              {playlistMeta(selected)}
            </span>
          )}
        </span>
        <Select.Icon>
          <ChevronDown
            size={16}
            className="text-text-muted group-hover:text-text-primary transition-colors"
          />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
          className="bg-bg-panel border border-border-muted rounded-[10px] shadow-[0_8px_24px_rgba(1,4,9,0.55),0_1px_3px_rgba(1,4,9,0.4)] p-1 z-50 w-[var(--radix-select-trigger-width)]"
        >
          <Select.Viewport>
            {playlists.map((p) => (
              <Select.Item
                key={p._id}
                value={p._id}
                className="flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-text-muted data-[highlighted]:bg-bg-hover data-[highlighted]:text-text-primary data-[state=checked]:text-text-primary cursor-pointer outline-none"
              >
                <Select.ItemText>{p.name}</Select.ItemText>
                <Select.ItemIndicator className="ml-auto">
                  <Check size={14} className="text-accent-blue" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 flex-none"
    >
      <span
        className={`w-9 h-5 rounded-full relative transition-colors ${
          checked ? "bg-accent-blue" : "bg-border-hover"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
            checked ? "bg-white" : "bg-text-primary/90"
          }`}
          style={{ transform: `translateX(${checked ? 16 : 0}px)` }}
        />
      </span>
      <span className="text-text-primary text-sm font-medium">{label}</span>
    </button>
  );
}

function DeviceConflictPanel({
  device,
  conflict,
  beginDT,
  endDT,
  override,
  onToggleOverride,
}) {
  const status = getAssignmentStatus(conflict, device);
  const pill = STATUS_PILL[status];
  const { afterNeeded } = classifyOverride(conflict, beginDT, endDT);
  const { start, end } = overlapRange(conflict, beginDT, endDT);
  const cBegin = new Date(conflict.beginDT);
  const cEnd = new Date(conflict.endDT);
  const playlistName = conflict.playlistId?.name ?? "Unknown playlist";

  return (
    <div
      className={`mt-3 -mx-3 -mb-3 px-3 pb-3 pt-3 border-t flex items-center gap-3 ${
        override
          ? "border-border-muted bg-bg-hover/40"
          : "border-accent-amber/30 bg-accent-amber/10"
      }`}
    >
      <div className="flex-1 flex items-start gap-2 min-w-0">
        <TriangleAlert
          size={15}
          className={`flex-none mt-0.5 ${
            override ? "text-text-muted" : "text-accent-amber"
          }`}
        />
        <div className="flex-1 min-w-0">
          {override ? (
            <p className="text-text-primary text-[13px] m-0">
              Overriding '{playlistName}'
              {afterNeeded
                ? ` for ${formatRange(new Date(beginDT), new Date(endDT))} — it resumes after`
                : ` (${formatRange(cBegin, cEnd)})`}
            </p>
          ) : (
            <p className="text-accent-amber text-[13px] m-0">
              Conflicts with '{playlistName}' ({formatRange(cBegin, cEnd)})
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${pill.className}`}
            >
              {pill.label}
            </span>
            <span className="text-text-muted text-xs">
              {override
                ? `Original window ${formatRange(cBegin, cEnd)}`
                : `Overlaps ${formatRange(start, end)}`}
            </span>
          </div>
        </div>
      </div>
      <ToggleSwitch
        checked={override}
        onChange={onToggleOverride}
        label="Override"
      />
    </div>
  );
}


function DeviceRow({
  device,
  checked,
  onToggle,
  conflict,
  beginDT,
  endDT,
  override,
  onToggleOverride,
}) {
  return (
    <div
      className={`rounded-lg border p-3 overflow-hidden transition-colors ${
        checked && conflict && !override
          ? "border-accent-amber/40"
          : "border-border-muted"
      }`}
    >
      <div className="flex items-center gap-3">
        <SelectCheckbox checked={checked} onClick={onToggle} alwaysVisible />
        <span
          className={`w-2 h-2 rounded-full flex-none ${
            device.status === "online" ? "bg-accent-green" : "bg-text-muted"
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-text-primary font-semibold text-sm m-0">
            {device.name}
          </p>
          <p className="text-text-muted text-xs m-0">
            {device.status === "online" ? "Online" : "Offline"} · seen{" "}
            {timeAgo(device.lastSeenAt)}
            {checked && device.status !== "online" && " · gets it on reconnect"}
          </p>
        </div>
      </div>
      {checked && conflict && (
        <DeviceConflictPanel
          device={device}
          conflict={conflict}
          beginDT={beginDT}
          endDT={endDT}
          override={override}
          onToggleOverride={onToggleOverride}
        />
      )}
    </div>
  );
}

// Owns all form state — mounted fresh every time the modal opens (same
// pattern as ContentPickerModal's PickerFormBody) so it always starts
// from clean defaults instead of syncing props into state via an effect.
function PublishModalBody({ playlists, devices, assignment, onOpenChange, onPublished }) {
  const editingDeviceId = assignment?.deviceId?._id ?? assignment?.deviceId ?? null;

  const [playlistId, setPlaylistId] = useState(
    assignment?.playlistId?._id ?? playlists[0]?._id ?? "",
  );

  const [beginDT, setBeginDT] = useState(() => {
    if (assignment) return toLocalInputValue(new Date(assignment.beginDT));
    const d = new Date(Date.now() + 5 * 60000);
    d.setSeconds(0, 0);
    return toLocalInputValue(d);
  });
  const [endDT, setEndDT] = useState(() => {
    if (assignment) return toLocalInputValue(new Date(assignment.endDT));
    const d = new Date(Date.now() + 5 * 60000);
    d.setSeconds(0, 0);
    return toLocalInputValue(new Date(d.getTime() + 60 * 60000));
  });

  const [selectedIds, setSelectedIds] = useState(
    new Set(editingDeviceId ? [editingDeviceId] : []),
  );
  const [overrides, setOverrides] = useState(new Map());
  const [submitting, setSubmitting] = useState(false);

  function toggleDevice(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllDevices() {
    if (selectedIds.size === devices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(devices.map((d) => d._id)));
    }
  }

  function toggleOverride(id) {
    setOverrides((prev) => {
      const next = new Map(prev);
      next.set(id, !next.get(id));
      return next;
    });
  }

  const begin = new Date(beginDT);
  const end = new Date(endDT);
  const maxScheduleDate = new Date();
  maxScheduleDate.setMonth(maxScheduleDate.getMonth() + 3);
  const beginError =
    beginDT && begin <= new Date()
      ? "This time has already passed — pick a time after now."
      : beginDT && begin > maxScheduleDate
        ? "Please pick a date within the next 3 months."
        : null;
  const endError =
    endDT && end <= begin
      ? "End time must be after the start time."
      : endDT && end > maxScheduleDate
        ? "Please pick a date within the next 3 months."
        : null;

  const conflictsByDevice = new Map(
    Array.from(selectedIds, (id) => {
      const device = devices.find((d) => d._id === id);
      return [id, findConflict(device, beginDT, endDT, assignment?._id)];
    }),
  );
  const unresolvedCount = Array.from(selectedIds).filter(
    (id) => conflictsByDevice.get(id) && !overrides.get(id),
  ).length;
  const overrideCount = Array.from(selectedIds).filter((id) => overrides.get(id)).length;

  const canPublish =
    selectedIds.size > 0 && !beginError && !endError && unresolvedCount === 0 && playlistId;

  function getFooter() {
    if (selectedIds.size === 0) {
      return { message: "Select at least one device.", tone: "muted" };
    }
    if (beginError) return { message: beginError, tone: "error" };
    if (endError) return { message: endError, tone: "error" };
    if (unresolvedCount > 0) {
      return {
        message: `Resolve ${unresolvedCount} conflict${unresolvedCount > 1 ? "s" : ""} to publish — override it or deselect the device.`,
        tone: "error",
      };
    }
    return {
      message: `Publishing to ${selectedIds.size} device${selectedIds.size > 1 ? "s" : ""}${
        overrideCount > 0 ? ` · ${overrideCount} override${overrideCount > 1 ? "s" : ""}` : ""
      }.`,
      tone: "muted",
    };
  }
  const { message: footerMessage, tone: footerTone } = getFooter();

  async function resolveConflict(conflict, deviceId) {
    const { beforeNeeded, afterNeeded } = classifyOverride(conflict, beginDT, endDT);
    if (beforeNeeded && afterNeeded) {
      await updateAssignment(conflict._id, { endDT: beginDT });
      await createAssignment({
        deviceId,
        playlistId: conflict.playlistId?._id ?? conflict.playlistId,
        beginDT: endDT,
        endDT: conflict.endDT,
      });
    } else if (beforeNeeded) {
      await updateAssignment(conflict._id, { endDT: beginDT });
    } else if (afterNeeded) {
      await updateAssignment(conflict._id, { beginDT: endDT });
    } else {
      await deleteAssignment(conflict._id);
    }
  }

  async function handlePublish() {
    if (!canPublish) return;
    setSubmitting(true);
    try {
      for (const deviceId of selectedIds) {
        const conflict = conflictsByDevice.get(deviceId);
        if (conflict) {
          await resolveConflict(conflict, deviceId);
        }

        if (assignment && deviceId === editingDeviceId) {
          await updateAssignment(assignment._id, { deviceId, playlistId, beginDT, endDT });
        } else {
          await createAssignment({ deviceId, playlistId, beginDT, endDT });
        }
      }
      onPublished();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  const runsLabel =
    !beginError && !endError
      ? `Runs ${formatDuration(end - begin)} on ${begin.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} · device local time.`
      : null;

  return (
    <>
      <ScrollBox className="px-6 pt-5 pb-5">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">
        {/* left pane */}
        <div className="flex-1 flex flex-col gap-5 lg:max-w-[360px] lg:pr-6">
          <div>
            <h3 className="text-text-primary font-bold text-sm mb-2">Playlist</h3>
            <PlaylistSelectField
              playlists={playlists}
              value={playlistId}
              onChange={setPlaylistId}
            />
          </div>

          <div>
            <h3 className="text-text-primary font-bold text-sm mb-2">Schedule</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-text-muted text-xs font-semibold mb-1.5">
                  Begins at
                </label>
                <DateTimeField
                  value={beginDT}
                  onChange={setBeginDT}
                  minDate={new Date()}
                  maxDate={maxScheduleDate}
                  error={!!beginError}
                  errorMessage={beginError}
                />
                <p
                  className={`text-xs mt-1.5 ${beginError ? "text-accent-red font-medium" : "text-text-muted"}`}
                >
                  {beginError ?? `Must be later than now (${new Date().toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })})`}
                </p>
              </div>

              <div>
                <label className="block text-text-muted text-xs font-semibold mb-1.5">
                  Ends at
                </label>
                <DateTimeField
                  value={endDT}
                  onChange={setEndDT}
                  minDate={begin}
                  maxDate={maxScheduleDate}
                  error={!!endError}
                  errorMessage={endError}
                  openDirection="above"
                />
                <p
                  className={`text-xs mt-1.5 ${endError ? "text-accent-red font-medium" : "text-text-muted"}`}
                >
                  {endError ?? "Must be after the begin time"}
                </p>
              </div>

              {runsLabel && <p className="text-text-muted text-xs">{runsLabel}</p>}
            </div>
          </div>
        </div>

        {/* right pane */}
        <div className="flex-1 flex flex-col gap-3 min-h-0 lg:border-l lg:border-border-muted lg:bg-bg-primary lg:-mt-5 lg:-mr-6 lg:-mb-5 lg:pl-6 lg:pt-5 lg:pb-5 lg:pr-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-text-primary font-bold text-sm m-0">Devices</h3>
              <p className="text-text-muted text-xs m-0">
                {selectedIds.size} of {devices.length} selected · checked against each
                schedule
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAllDevices}
              className="text-accent-blue text-sm font-medium hover:underline flex-none"
            >
              {selectedIds.size === devices.length ? "Clear" : "Select all"}
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {devices.map((device) => (
              <DeviceRow
                key={device._id}
                device={device}
                checked={selectedIds.has(device._id)}
                onToggle={() => toggleDevice(device._id)}
                conflict={conflictsByDevice.get(device._id)}
                beginDT={beginDT}
                endDT={endDT}
                override={!!overrides.get(device._id)}
                onToggleOverride={() => toggleOverride(device._id)}
              />
            ))}
          </div>
        </div>
      </div>
      </ScrollBox>

      <div className="flex items-center gap-3 px-6 py-4 border-t border-border-muted">
        <p
          className={`text-[13px] m-0 flex-1 ${
            footerTone === "error" ? "text-accent-red font-medium" : "text-text-muted"
          }`}
        >
          {footerTone === "error" && (
            <TriangleAlert size={14} className="inline-block mr-1.5 -mt-0.5" />
          )}
          {footerMessage}
        </p>
        <Dialog.Close
          type="button"
          className="h-10 text-text-muted border border-border-muted hover:border-border-hover hover:bg-bg-hover hover:text-text-primary rounded-lg px-4 text-sm font-semibold transition-colors flex-none"
        >
          Cancel
        </Dialog.Close>
        <Button
          type="button"
          icon={Send}
          disabled={!canPublish || submitting}
          onClick={handlePublish}
          className="flex-none"
        >
          {assignment ? "Save" : "Publish"}
        </Button>
      </div>
    </>
  );
}

function PublishModal({ open, onOpenChange, playlists, devices, assignment, onPublished }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <Dialog.Portal>
        {/* Plain div, not Dialog.Overlay: Radix's Overlay renders null whenever
            modal={false} (set above to stop the Dialog's focus trap from
            fighting the DateTimeField popover), so it would never show.
            Dismissal on backdrop click is wired explicitly below (onClick)
            instead of relying on Dialog's own outside-click heuristic. */}
        <div
          aria-hidden
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
        />
        <Dialog.Content
          onInteractOutside={(e) => {
            // With modal={false}, Radix decides for itself what counts as
            // "outside" — and it gets this wrong for anything that portals
            // elsewhere (Select's dropdown, DateTimeField's popover, any
            // ActionMenu): once one of those closes on a first click, a
            // fast second click can land on whatever is now underneath
            // (e.g. the plain backdrop div above), which Radix then reads
            // as a genuine dismiss click. Rather than chase every such
            // edge case, outside-interaction auto-close is disabled
            // entirely — the backdrop's own onClick above is the only
            // "click outside to close" path now, alongside Escape and the
            // Cancel/X buttons.
            e.preventDefault();
          }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-muted rounded-xl w-[900px] max-w-[calc(100vw-32px)] max-h-[85vh] flex flex-col z-40"
        >
          <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-border-muted">
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-text-primary font-bold text-lg m-0">
                {assignment ? "Edit assignment" : "Publish playlist"}
              </Dialog.Title>
              <p className="text-text-muted text-sm mt-1">
                Choose what plays, when, and on which screens.
              </p>
            </div>
            <CancelButton as={Dialog.Close} />
          </div>

          {open && (
            <PublishModalBody
              playlists={playlists}
              devices={devices}
              assignment={assignment}
              onOpenChange={onOpenChange}
              onPublished={onPublished}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default PublishModal;

// Replaces the old standalone /publish page. One modal handles both
// "Publish" (create, multi-device) and "Edit" (pass `assignment`, locks
// initial selection to its own device, calls updateAssignment instead of
// createAssignment for that device) — same UI shell either way, matching
// Assignment-Menu-Reference.html's stated intent ("Edit opens the modal
// pre-filled").
//
// Conflict model: a device can only play one thing at a time. If the
// chosen window overlaps an existing assignment on a selected device,
// that device's row shows a warning panel with an Override toggle —
// Publish stays disabled until every conflict is either overridden or
// its device is deselected. Overriding truncates the conflicting
// assignment's begin/end to make room, or — if the new window falls
// entirely inside the old one's span — splits it into a "before" and
// "after" fragment (the "it resumes after" case). Nothing is mutated
// until Publish is actually clicked; toggles are local UI state only
// until then. See utils/publishConflicts.js for the overlap/classify
// logic this reads.
//
// Reused from elsewhere: input/select field styling from
// ContentDetailsPanel.jsx's Name field, dropdown pattern from
// StyledSelect.jsx, device-row checkbox from SelectCheckbox.jsx, footer
// Cancel/Submit button layout from ContentPickerModal.jsx.
// Used by: pages/Assignments.jsx.
