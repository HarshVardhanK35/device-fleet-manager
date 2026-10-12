import { useState, useEffect } from "react";
import {
  Plus,
  Hourglass,
  Monitor,
  ArrowRight,
  ArrowDown,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plug,
} from "lucide-react";

import ScreenThumb from "../components/ScreenThumb.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Button from "../components/Button.jsx";
import GhostButton from "../components/GhostButton.jsx";
import ReleaseScreenButton from "../components/ReleaseScreenButton.jsx";
import DetailPane from "../components/DetailPane.jsx";
import ActionMenu from "../components/ActionMenu.jsx";
import SelectableRow from "../components/SelectableRow.jsx";
import SkeletonPlayerSlots from "../components/SkeletonPlayerSlots.jsx";
import SkeletonPanel from "../components/SkeletonPanel.jsx";
import PreviewModal from "../components/PreviewModal.jsx";
import TakeOverModal from "../components/TakeOverModal.jsx";
import RemoveConfirmModal from "../components/RemoveConfirmModal.jsx";
import PlayerStandinModal from "../components/PlayerStandinModal.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { pillLabel } from "../utils/screenStatus.js";
import { claimPairingCode } from "../api/pairing.js";
import {
  getDevices,
  updateDevice,
  deleteDevice,
  takeOverDevice,
  releaseDevice,
} from "../api/devices.js";
import { getAssignments } from "../api/assignments.js";
import { timeAgo } from "../utils/timeAgo.js";

const MAX_SCREENS = 3;
// Must match the backend's code length (server/controllers/pairingController.js's
// ALPHABET loop) — both sides of the same pairing flow have to agree on the
// code shape.
const PAIRING_CODE_LENGTH = 8;

// Picks whichever assignment currently covers "now" for this device (same
// simple beginDT/endDT comparison as components/DevicePlayback.jsx — just
// evaluated once on fetch, not live/MQTT-driven) and returns its playlist's
// first content item, shaped for ScreenThumb. Not a live mirror of what's
// actually on the physical screen right now — see future-implementations.md
// for that (deferred, needs MQTT).
function computePlaying(assignments, deviceId) {
  const now = Date.now();
  const active = assignments.find((a) => {
    if (!a.deviceId || a.deviceId._id !== deviceId) return false;
    const begin = a.beginDT ? new Date(a.beginDT).getTime() : -Infinity;
    const end = new Date(a.endDT).getTime();
    return now >= begin && now <= end;
  });

  const items = active?.playlistId?.contentItems;
  const first = items?.[0];
  if (!first) return null;

  return {
    type: first.type,
    name: first.name,
    mediaUrl: first.mediaUrl,
    thumbnailUrl: first.thumbnailUrl,
    playlistName: active.playlistId.name,
    pos: items.length > 1 ? `1 of ${items.length}` : null,
    nextName: items[1]?.name || null,
  };
}

// Maps a real backend Device into this page's local "screen" shape. `res`
// has no backend source yet (no resolution reporting) — shown as unknown
// rather than invented.
function mapDevice(d, playing = null) {
  return {
    id: d._id,
    name: d.name,
    type: d.type || "",
    pending: false,
    status: d.status,
    seen:
      d.status === "online"
        ? "Online now"
        : `Last seen ${timeAgo(d.lastSeenAt)}`,
    res: "—",
    playing,
  };
}

function PlayerSlots() {
  const [screens, setScreens] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mobileView, setMobileView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", type: "" });
  const [editError, setEditError] = useState("");
  const [codes, setCodes] = useState({});
  const [codeFocused, setCodeFocused] = useState(false);
  const [pairErrors, setPairErrors] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [modal, setModal] = useState(null); // { mode: "preview"|"take"|"remove"|"player", id }
  const [ack, setAck] = useState(false);
  const [loading, setLoading] = useState(true);
  const [removeError, setRemoveError] = useState("");
  const [takeOverError, setTakeOverError] = useState("");
  const [releaseError, setReleaseError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [devicesData, assignmentsData] = await Promise.all([
        getDevices(),
        getAssignments(),
      ]);
      if (cancelled) return;
      const assignments = Array.isArray(assignmentsData) ? assignmentsData : [];
      const mapped = Array.isArray(devicesData)
        ? devicesData.map((d) =>
            mapDevice(d, computePlaying(assignments, d._id)),
          )
        : [];
      setScreens(mapped);
      if (mapped.length) setSelectedId(mapped[0].id);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const used = screens.length;
  const full = used >= MAX_SCREENS;
  const selected = screens.find((s) => s.id === selectedId) || null;
  const selectedSlot = selected
    ? screens.findIndex((s) => s.id === selected.id) + 1
    : null;
  const modalScreen = modal
    ? screens.find((s) => s.id === modal.id) || null
    : null;
  const previewScreen = modal?.mode === "preview" ? modalScreen : null;

  function selectScreen(id) {
    setSelectedId(id);
    setMobileView("detail");
  }

  function addScreen() {
    if (full) return;
    const used = new Set(screens.map((s) => s.name));
    let n = 1;
    while (used.has(`Screen ${n}`)) n++;
    const id = `n${Date.now()}`;
    const next = { id, name: `Screen ${n}`, pending: true };
    setScreens((prev) => [...prev, next]);
    selectScreen(id);
  }

  async function handlePair(id) {
    const code = codes[id] || "";
    if (code.length < PAIRING_CODE_LENGTH || busyId) return;
    setBusyId(id);

    const slotName = (screens.find((s) => s.id === id) || {}).name || "";
    const result = await claimPairingCode(code, { name: slotName, type: "" });
    setBusyId(null);

    if (!result || result.message) {
      setPairErrors((prev) => ({
        ...prev,
        [id]:
          result?.message || "Pairing failed. Check the code and try again.",
      }));
      return;
    }

    setPairErrors((prev) => ({ ...prev, [id]: "" }));
    setCodes((prev) => ({ ...prev, [id]: "" }));
    setScreens((prev) =>
      prev.map((s) => (s.id === id ? mapDevice(result) : s)),
    );
    setSelectedId((prev) => (prev === id ? result._id : prev));
    setEditingId(result._id);
    setDraft({ name: result.name, type: result.type || "" });
  }

  function cancelPairing(id) {
    setScreens((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) {
      const remaining = screens.filter((s) => s.id !== id);
      setSelectedId(remaining.length ? remaining[0].id : null);
      setMobileView("list");
    }
  }

  function startEdit(screen) {
    setEditingId(screen.id);
    setDraft({ name: screen.name, type: screen.type || "" });
    setEditError("");
  }

  async function saveEdit(id) {
    const current = screens.find((s) => s.id === id);
    const name = draft.name.trim() || current?.name || "";
    const type = draft.type.trim();

    const result = await updateDevice(id, { name, type });
    if (!result || result.message) {
      setEditError(result?.message || "Couldn't save changes. Try again.");
      return;
    }

    setEditError("");
    setScreens((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name, type } : s)),
    );
    setEditingId(null);
  }

  async function removeScreen(id) {
    const result = await deleteDevice(id);
    // deleteDevice's success response is also { message: "Device deleted" },
    // unlike other endpoints where success has no `message` field at all —
    // so check the exact success text rather than just "has a message".
    if (!result || result.message !== "Device deleted") {
      setRemoveError(
        result?.message || "Couldn't remove this screen. Try again.",
      );
      return;
    }

    setRemoveError("");
    setScreens((prev) => prev.filter((s) => s.id !== id));
    setModal(null);
    if (selectedId === id) {
      const remaining = screens.filter((s) => s.id !== id);
      setSelectedId(remaining.length ? remaining[0].id : null);
      setMobileView("list");
    }
  }

  async function confirmTakeOver() {
    if (!ack || !modal) return;
    const id = modal.id;

    const result = await takeOverDevice(id);
    if (!result || result.message !== "Take-over signal sent") {
      setTakeOverError(
        result?.message || "Couldn't take over this screen. Try again.",
      );
      return;
    }

    setAck(false);
    setTakeOverError("");
    setScreens((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              prevStatus: s.status,
              status: "taken",
              seen: "Physical screen disconnected",
            }
          : s,
      ),
    );
    setModal({ mode: "player", id });
  }

  async function releaseScreen(id) {
    const result = await releaseDevice(id);
    if (!result || result.message !== "Release signal sent") {
      setReleaseError(result?.message || "Couldn't release this screen. Try again.");
      return;
    }

    setReleaseError("");
    // Optimistic, but honest: the real screen still has to receive the
    // signal and re-register its own connection — this doesn't claim
    // "online" outright the way the old local-only version did.
    setScreens((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "offline", seen: "Released — waiting to reconnect" }
          : s,
      ),
    );
    setModal(null);
  }

  return (
    <div
      className={`mx-auto lg:max-w-7xl pb-20 md:pb-0 pr-[10px] ${
        mobileView === "detail" ? "max-w-3xl" : "max-w-xl"
      }`}
    >
      <div className="flex gap-4">
        {/* slot rail */}
        <div
          className={`w-full lg:w-72 lg:flex-shrink-0 flex flex-col gap-2 ${
            mobileView === "detail" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="mb-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-text-primary text-xl font-bold m-0">
                Player
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border-muted bg-bg-panel text-xs text-text-muted">
                <span
                  className={`font-semibold ${full ? "text-accent-amber" : "text-text-primary"}`}
                >
                  {used} of {MAX_SCREENS}
                </span>
                screens used
              </span>
            </div>
            <p className="text-text-muted text-xs mt-1">
              Three slots per account. Pick one to manage it.
            </p>
          </div>

          {loading ? (
            <SkeletonPlayerSlots />
          ) : (
            [0, 1, 2].map((i) => {
              const s = screens[i];
              if (!s) {
                return (
                  <button
                    key={`empty-${i}`}
                    type="button"
                    onClick={addScreen}
                    disabled={full}
                    className="flex items-center gap-2.5 p-3 rounded-lg border border-dashed border-border-muted hover:border-accent-blue text-text-muted hover:text-text-primary transition-colors text-left disabled:opacity-40 disabled:hover:border-border-muted disabled:hover:text-text-muted"
                  >
                    <span className="w-7 h-7 rounded-md bg-bg-hover flex items-center justify-center flex-none">
                      <Plus size={14} />
                    </span>
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wide">
                        Slot {i + 1}
                      </span>
                      <span className="text-sm">Add a screen</span>
                    </span>
                  </button>
                );
              }
              return (
                <SelectableRow
                  as="button"
                  key={s.id}
                  onClick={() => selectScreen(s.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border hover:bg-bg-hover ${
                    selectedId === s.id
                      ? s.pending
                        ? "border-accent-amber bg-bg-hover"
                        : "border-accent-blue bg-bg-hover"
                      : "border-border-muted"
                  }`}
                >
                  <span className="w-14 aspect-video rounded overflow-hidden border border-border-muted flex-none bg-bg-primary">
                    {s.pending ? (
                      <span className="w-full h-full flex items-center justify-center">
                        <Hourglass size={14} className="text-accent-amber" />
                      </span>
                    ) : (
                      <ScreenThumb playing={s.playing} mini />
                    )}
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                      Slot {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {s.name}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-text-muted">
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-none ${
                          s.pending
                            ? "bg-accent-amber"
                            : s.status === "online"
                              ? "bg-accent-green"
                              : s.status === "taken"
                                ? "bg-accent-amber"
                                : "bg-text-muted"
                        }`}
                      />
                      {pillLabel(s)}
                    </span>
                  </span>
                </SelectableRow>
              );
            })
          )}
        </div>

        {/* detail pane */}
        <div
          className={`flex-1 min-w-0 flex flex-col gap-3 ${
            mobileView === "list" ? "hidden lg:flex" : "flex"
          }`}
        >
          {loading && <SkeletonPanel rows={3} />}

          {!loading && !selected && screens.length === 0 && (
            <EmptyState
              title="Add your first screen"
              description={
                <>
                  1. Add a screen — it takes a slot.
                  <br />
                  2. On the TV, tablet or monitor browser, open{" "}
                  <a
                    href="http://localhost:5173/screens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue hover:underline"
                  >
                    Screens.
                  </a>{" "}
                  <br />
                  3. Type the 8-character code after clicking{" "}
                  <strong>Add a screen</strong> below.
                </>
              }
              actionLabel="Add your first screen"
              actionIcon={Plus}
              onAction={addScreen}
            />
          )}

          {!loading && !selected && screens.length > 0 && (
            <EmptyState
              title="Select a screen"
              description="Pick a slot on the left to manage it."
            />
          )}

          {!loading && selected && selected.pending && (
            <DetailPane
              backLabel="All screens"
              onBack={() => setMobileView("list")}
              title={selected.name}
              badge={<StatusPill screen={selected} />}
              meta={`Slot ${selectedSlot}`}
              headerExtra={
                <GhostButton onClick={() => cancelPairing(selected.id)}>
                  Cancel
                </GhostButton>
              }
            >
              <div className="flex flex-col md:flex-row gap-3 items-stretch">
                <div className="flex-1 min-w-0 aspect-video rounded-lg border border-dashed border-border-hover bg-[repeating-linear-gradient(135deg,#0d1117_0_8px,#11161d_8px_16px)] flex flex-col items-center justify-center gap-2 text-center px-4">
                  <Monitor size={28} className="text-border-hover" />
                  <span className="text-text-muted text-sm">
                    The physical screen
                  </span>
                  <span className="text-text-muted text-xs">
                    Open /screens on it — a code appears
                  </span>
                </div>
                <div className="flex-none flex items-center justify-center text-accent-amber">
                  <ArrowRight size={18} className="hidden md:block" />
                  <ArrowDown size={18} className="md:hidden" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-3 p-4 rounded-lg bg-bg-primary border border-accent-amber/35">
                  <span className="text-text-primary text-sm font-semibold">
                    Enter the code shown on the screen
                  </span>
                  <div className="relative flex gap-1.5 w-full max-w-[380px]">
                    {Array.from({ length: PAIRING_CODE_LENGTH }, (_, i) => {
                      const typed = codes[selected.id] || "";
                      const isActive = i === typed.length;
                      return (
                        <div
                          key={i}
                          className={`flex-1 h-11 rounded-lg border bg-bg-panel flex items-center justify-center font-mono text-lg font-semibold ${
                            typed[i]
                              ? "border-border-hover"
                              : isActive
                                ? "border-accent-blue"
                                : "border-border-muted"
                          }`}
                        >
                          {typed[i] ||
                            (isActive && codeFocused && (
                              <span className="caret-blink w-[2px] h-5 bg-accent-blue" />
                            ))}
                        </div>
                      );
                    })}
                    <input
                      value={codes[selected.id] || ""}
                      onChange={(e) => {
                        setPairErrors((prev) => ({
                          ...prev,
                          [selected.id]: "",
                        }));
                        setCodes((prev) => ({
                          ...prev,
                          [selected.id]: e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, PAIRING_CODE_LENGTH),
                        }));
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handlePair(selected.id)
                      }
                      onFocus={() => setCodeFocused(true)}
                      onBlur={() => setCodeFocused(false)}
                      maxLength={PAIRING_CODE_LENGTH}
                      autoComplete="off"
                      aria-label="Pairing code"
                      className="absolute inset-0 w-full opacity-0 cursor-text text-base"
                    />
                  </div>
                  <span
                    className={`text-xs ${pairErrors[selected.id] ? "text-accent-red" : "text-text-muted"}`}
                  >
                    {busyId === selected.id
                      ? "Connecting to the screen…"
                      : pairErrors[selected.id]
                        ? pairErrors[selected.id]
                        : (codes[selected.id] || "").length ===
                            PAIRING_CODE_LENGTH
                          ? "Press Enter or Pair screen"
                          : "Codes expire after 15 minutes"}
                  </span>
                  <div>
                    <Button
                      icon={Plug}
                      onClick={() => handlePair(selected.id)}
                      disabled={
                        (codes[selected.id] || "").length <
                          PAIRING_CODE_LENGTH || !!busyId
                      }
                      className="!min-h-9"
                    >
                      {busyId === selected.id ? "Pairing…" : "Pair screen"}
                    </Button>
                  </div>
                </div>
              </div>
            </DetailPane>
          )}

          {!loading && selected && !selected.pending && (
            <DetailPane
              backLabel="All screens"
              onBack={() => setMobileView("list")}
              title={selected.name}
              badge={<StatusPill screen={selected} dot />}
              meta={`Slot ${selectedSlot} · ${selected.type || "No type set"}`}
              headerExtra={
                <ActionMenu
                  label="Screen actions"
                  align="end"
                  items={[
                    {
                      label: "Edit",
                      icon: Pencil,
                      onClick: () => startEdit(selected),
                    },
                    {
                      label: "Preview",
                      icon: Eye,
                      onClick: () =>
                        setModal({ mode: "preview", id: selected.id }),
                    },
                    { type: "separator" },
                    {
                      label: "Remove screen",
                      icon: Trash2,
                      variant: "danger",
                      onClick: () =>
                        setModal({ mode: "remove", id: selected.id }),
                    },
                  ]}
                  trigger={
                    <button
                      type="button"
                      aria-label="Screen actions"
                      className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors flex-none"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  }
                />
              }
            >
              <div className="flex flex-col gap-5">
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="flex-[1.5] min-w-0 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setModal({ mode: "preview", id: selected.id })
                      }
                      className="aspect-video rounded-lg overflow-hidden border border-border-muted hover:border-border-hover transition-colors block w-full"
                    >
                      <ScreenThumb playing={selected.playing} />
                    </button>
                    <span className="text-text-muted text-xs">
                      Click to preview — the physical screen isn't affected.
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    {[
                      [
                        "Now playing",
                        selected.playing
                          ? selected.playing.playlistName
                          : "Nothing scheduled",
                      ],
                      [
                        "Item",
                        selected.playing
                          ? `${selected.playing.name}${selected.playing.pos ? ` · ${selected.playing.pos}` : ""}`
                          : "—",
                      ],
                      [
                        "Up next",
                        selected.playing
                          ? selected.playing.nextName || "—"
                          : "—",
                      ],
                      ["Connection", selected.seen],
                      ["Resolution", selected.res],
                    ].map(([label, value], i, arr) => (
                      <div
                        key={label}
                        className={`flex justify-between gap-3 py-2.5 text-xs ${
                          i < arr.length - 1 ? "border-b border-bg-hover" : ""
                        }`}
                      >
                        <span className="text-text-muted">{label}</span>
                        <span className="text-text-primary text-right">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border-muted">
                  <span className="text-text-primary text-sm font-semibold">
                    Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">
                      Name
                      <input
                        value={
                          editingId === selected.id ? draft.name : selected.name
                        }
                        onChange={(e) => {
                          setEditingId(selected.id);
                          setDraft((d) => ({ ...d, name: e.target.value }));
                        }}
                        className="h-9 px-2.5 rounded-lg border border-border-muted bg-bg-primary text-text-primary text-sm outline-none focus-visible:border-accent-blue"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">
                      Type
                      <input
                        value={
                          editingId === selected.id
                            ? draft.type
                            : selected.type || ""
                        }
                        onChange={(e) => {
                          setEditingId(selected.id);
                          setDraft((d) => ({ ...d, type: e.target.value }));
                        }}
                        placeholder="Free text — TV, iPad, kiosk monitor…"
                        className="h-9 px-2.5 rounded-lg border border-border-muted bg-bg-primary text-text-primary text-sm outline-none focus-visible:border-accent-blue"
                      />
                    </label>
                  </div>
                  {editingId === selected.id && (
                    <div className="flex flex-col gap-2">
                      {editError && (
                        <span className="text-accent-red text-xs">
                          {editError}
                        </span>
                      )}
                      <div className="flex gap-2">
                        <GhostButton
                          size="lg"
                          onClick={() => {
                            setEditingId(null);
                            setEditError("");
                          }}
                        >
                          Discard
                        </GhostButton>
                        <Button onClick={() => saveEdit(selected.id)}>
                          Save changes
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 p-4 rounded-lg border border-accent-red/35 bg-accent-red/[0.04]">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-accent-red text-sm font-semibold">
                        <Plug size={15} />
                        Take over this screen
                      </span>
                      <span className="text-text-muted text-xs leading-relaxed">
                        Opens the full player here and disconnects the physical
                        screen at once — only one connection per screen is
                        allowed.
                      </span>
                    </div>
                    {selected.status !== "taken" ? (
                      <Button
                        icon={Plug}
                        onClick={() => {
                          setModal({ mode: "take", id: selected.id });
                          setAck(false);
                          setTakeOverError("");
                        }}
                        className="!bg-accent-red !border-accent-red hover:!brightness-110 flex-none"
                      >
                        Take over…
                      </Button>
                    ) : (
                      <div className="flex gap-2 flex-wrap flex-none">
                        <button
                          type="button"
                          onClick={() =>
                            setModal({ mode: "player", id: selected.id })
                          }
                          className="h-9 px-3 rounded-lg border border-border-muted bg-bg-hover text-text-primary text-xs font-medium transition-colors"
                        >
                          Open player
                        </button>
                        <ReleaseScreenButton
                          onClick={() => releaseScreen(selected.id)}
                        />
                      </div>
                    )}
                  </div>
                  {releaseError && (
                    <span className="text-accent-red text-xs">{releaseError}</span>
                  )}
                </div>
              </div>
            </DetailPane>
          )}
        </div>
      </div>

      {/* modals */}
      <PreviewModal
        open={!!previewScreen}
        onOpenChange={(open) => !open && setModal(null)}
        title={previewScreen?.name}
        subtitle="Preview only — the physical screen keeps playing"
        media={
          previewScreen && <ScreenThumb playing={previewScreen.playing} bare />
        }
        meta={
          previewScreen
            ? [
                <StatusPill key="status" screen={previewScreen} />,
                <span key="playlist">
                  Playlist{" "}
                  <span className="text-text-primary">
                    {previewScreen.playing
                      ? previewScreen.playing.playlistName
                      : "Nothing scheduled"}
                  </span>
                </span>,
                ...(previewScreen.playing
                  ? [
                      <span key="item">
                        Item{" "}
                        <span className="text-text-primary">
                          {previewScreen.playing.name}
                          {previewScreen.playing.pos
                            ? ` · ${previewScreen.playing.pos}`
                            : ""}
                        </span>
                      </span>,
                    ]
                  : []),
                <span key="seen">{previewScreen.seen}</span>,
              ]
            : []
        }
      />

      <TakeOverModal
        open={modal?.mode === "take"}
        onOpenChange={(o) => {
          if (!o) {
            setModal(null);
            setTakeOverError("");
          }
        }}
        screen={modal?.mode === "take" ? modalScreen : null}
        ack={ack}
        onAckToggle={() => setAck((v) => !v)}
        onConfirm={confirmTakeOver}
        error={takeOverError}
      />

      <RemoveConfirmModal
        open={modal?.mode === "remove"}
        onOpenChange={(o) => {
          if (!o) {
            setModal(null);
            setRemoveError("");
          }
        }}
        icon={Trash2}
        title={modal?.mode === "remove" ? `Remove ${modalScreen?.name}?` : ""}
        description="It's unpaired from your account and frees one of your 3 slots. To use it again, pair it with a new code."
        confirmLabel="Remove screen"
        onConfirm={() => modalScreen && removeScreen(modalScreen.id)}
        error={removeError}
      />

      <PlayerStandinModal
        open={modal?.mode === "player"}
        onOpenChange={(o) => !o && setModal(null)}
        screen={modal?.mode === "player" ? modalScreen : null}
        onRelease={() => modalScreen && releaseScreen(modalScreen.id)}
      />
    </div>
  );
}

export default PlayerSlots;

// Player tab — manage up to 3 paired screens (devices), pair a new one via
// an 8-character code (entered here; generated/shown on the physical
// screen's own pairing page, pages/Screens.jsx at "/screens" — code shape
// must stay in sync between the two), preview without touching the live
// screen, and explicitly "take over" a screen (disconnects it, since only
// one connection per screen is ever allowed — see z-files/future-
// implementations.md's Preview-tab section for the full reasoning).
// Real backend wiring: fetching the screen list, pairing/claiming, editing
// (name/type), removing a screen, take-over, and release all go through the
// real API (api/devices.js, api/pairing.js) — take-over/release publish a
// real MQTT control message the screen reacts to. Still local-state-only,
// no backend yet: preview — it has no live streaming-state/manifest-
// correlation backend yet.
// Used by: App.jsx (route "/player", inside Layout/ProtectedRoute — not to
// be confused with pages/Player.jsx, the unauthenticated device-facing
// "/player/:deviceId" route a real paired screen uses).
