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

const MAX_SCREENS = 3;
// Must match Screens.jsx's CODE_LENGTH — both sides of the same pairing
// flow have to agree on the code shape.
const PAIRING_CODE_LENGTH = 8;

// Seed data so there's something to look at before this is wired to a real
// backend — matches the mock's "mixed" state (one online+playing, one
// offline, one pending). UI-only for now, per 2026-10-09 scope.
function seedScreens() {
  return [
    {
      id: "s1",
      name: "Lobby TV",
      type: '55" TV · entrance wall',
      pending: false,
      status: "online",
      seen: "Online now",
      res: "1920×1080",
      playing: {
        kicker: "SPRING MENU",
        title: "Oat latte",
        sub: "$4.50 · this season only",
        pos: "3 of 8",
        bg: "linear-gradient(135deg,#3d3014 0%,#161b22 72%)",
        playlist: "Spring Menu Loop",
        item: "Oat latte promo",
        next: "Pastry case",
      },
    },
    {
      id: "s2",
      name: "Back office",
      type: "iPad on a stand",
      pending: false,
      status: "offline",
      seen: "Last seen 2h ago",
      res: "2360×1640",
      playing: null,
    },
  ];
}

function PlayerSlots() {
  const [screens, setScreens] = useState(seedScreens);
  const [selectedId, setSelectedId] = useState("s1");
  const [mobileView, setMobileView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", type: "" });
  const [codes, setCodes] = useState({});
  const [codeFocused, setCodeFocused] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [modal, setModal] = useState(null); // { mode: "preview"|"take"|"remove"|"player", id }
  const [ack, setAck] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const used = screens.length;
  const full = used >= MAX_SCREENS;
  const selected = screens.find((s) => s.id === selectedId) || null;
  const selectedSlot = selected ? screens.findIndex((s) => s.id === selected.id) + 1 : null;
  const modalScreen = modal ? screens.find((s) => s.id === modal.id) || null : null;
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

  function handlePair(id) {
    const code = codes[id] || "";
    if (code.length < PAIRING_CODE_LENGTH || busyId) return;
    setBusyId(id);
    setTimeout(() => {
      setBusyId(null);
      setCodes((prev) => ({ ...prev, [id]: "" }));
      setScreens((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                id,
                name: s.name,
                type: "",
                pending: false,
                status: "online",
                seen: "Online · paired just now",
                res: "1920×1080",
                playing: null,
              }
            : s,
        ),
      );
      setEditingId(id);
      setDraft({ name: (screens.find((s) => s.id === id) || {}).name || "", type: "" });
    }, 1100);
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
  }

  function saveEdit(id) {
    setScreens((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, name: draft.name.trim() || s.name, type: draft.type.trim() }
          : s,
      ),
    );
    setEditingId(null);
  }

  function removeScreen(id) {
    setScreens((prev) => prev.filter((s) => s.id !== id));
    setModal(null);
    if (selectedId === id) {
      const remaining = screens.filter((s) => s.id !== id);
      setSelectedId(remaining.length ? remaining[0].id : null);
      setMobileView("list");
    }
  }

  function confirmTakeOver() {
    if (!ack || !modal) return;
    const id = modal.id;
    setAck(false);
    setScreens((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, prevStatus: s.status, status: "taken", seen: "Physical screen disconnected" }
          : s,
      ),
    );
    setModal({ mode: "player", id });
  }

  function releaseScreen(id) {
    setScreens((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.prevStatus || "online",
              seen: s.prevStatus === "offline" ? "Last seen 2h ago" : "Online · reconnected",
            }
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
              <h1 className="text-text-primary text-xl font-bold m-0">Player</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border-muted bg-bg-panel text-xs text-text-muted">
                <span className={`font-semibold ${full ? "text-accent-amber" : "text-text-primary"}`}>
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
              description="1. Add a screen — it takes a slot. 2. On the TV, tablet or monitor, open /screens in its browser. 3. Type the 8-character code it shows."
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
                <GhostButton onClick={() => cancelPairing(selected.id)}>Cancel</GhostButton>
              }
            >
              <div className="flex flex-col md:flex-row gap-3 items-stretch">
                <div className="flex-1 min-w-0 aspect-video rounded-lg border border-dashed border-border-hover bg-[repeating-linear-gradient(135deg,#0d1117_0_8px,#11161d_8px_16px)] flex flex-col items-center justify-center gap-2 text-center px-4">
                  <Monitor size={28} className="text-border-hover" />
                  <span className="text-text-muted text-sm">The physical screen</span>
                  <span className="text-text-muted text-xs">
                    Open /play on it — a code appears
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
                          {typed[i] || (isActive && codeFocused && (
                            <span className="caret-blink w-[2px] h-5 bg-accent-blue" />
                          ))}
                        </div>
                      );
                    })}
                    <input
                      value={codes[selected.id] || ""}
                      onChange={(e) =>
                        setCodes((prev) => ({
                          ...prev,
                          [selected.id]: e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, PAIRING_CODE_LENGTH),
                        }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handlePair(selected.id)}
                      onFocus={() => setCodeFocused(true)}
                      onBlur={() => setCodeFocused(false)}
                      maxLength={PAIRING_CODE_LENGTH}
                      autoComplete="off"
                      aria-label="Pairing code"
                      className="absolute inset-0 w-full opacity-0 cursor-text text-base"
                    />
                  </div>
                  <span className="text-text-muted text-xs">
                    {busyId === selected.id
                      ? "Connecting to the screen…"
                      : (codes[selected.id] || "").length === PAIRING_CODE_LENGTH
                        ? "Press Enter or Pair screen"
                        : "Codes expire after 15 minutes"}
                  </span>
                  <div>
                    <Button
                      icon={Plug}
                      onClick={() => handlePair(selected.id)}
                      disabled={(codes[selected.id] || "").length < PAIRING_CODE_LENGTH || !!busyId}
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
                    { label: "Edit", icon: Pencil, onClick: () => startEdit(selected) },
                    { label: "Preview", icon: Eye, onClick: () => setModal({ mode: "preview", id: selected.id }) },
                    { type: "separator" },
                    { label: "Remove screen", icon: Trash2, variant: "danger", onClick: () => setModal({ mode: "remove", id: selected.id }) },
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
                      onClick={() => setModal({ mode: "preview", id: selected.id })}
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
                      ["Now playing", selected.playing ? selected.playing.playlist : "Nothing scheduled"],
                      ["Item", selected.playing ? `${selected.playing.item} · ${selected.playing.pos}` : "—"],
                      ["Up next", selected.playing ? selected.playing.next : "—"],
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
                        <span className="text-text-primary text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border-muted">
                  <span className="text-text-primary text-sm font-semibold">Details</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">
                      Name
                      <input
                        value={editingId === selected.id ? draft.name : selected.name}
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
                        value={editingId === selected.id ? draft.type : selected.type || ""}
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
                    <div className="flex gap-2">
                      <GhostButton size="lg" onClick={() => setEditingId(null)}>
                        Discard
                      </GhostButton>
                      <Button onClick={() => saveEdit(selected.id)}>Save changes</Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 p-4 rounded-lg border border-accent-red/35 bg-accent-red/[0.04]">
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-accent-red text-sm font-semibold">
                      <Plug size={15} />
                      Take over this screen
                    </span>
                    <span className="text-text-muted text-xs leading-relaxed">
                      Opens the full player here and disconnects the physical screen at once —
                      only one connection per screen is allowed.
                    </span>
                  </div>
                  {selected.status !== "taken" ? (
                    <Button
                      icon={Plug}
                      onClick={() => {
                        setModal({ mode: "take", id: selected.id });
                        setAck(false);
                      }}
                      className="!bg-accent-red !border-accent-red hover:!brightness-110 flex-none"
                    >
                      Take over…
                    </Button>
                  ) : (
                    <div className="flex gap-2 flex-wrap flex-none">
                      <button
                        type="button"
                        onClick={() => setModal({ mode: "player", id: selected.id })}
                        className="h-9 px-3 rounded-lg border border-border-muted bg-bg-hover text-text-primary text-xs font-medium transition-colors"
                      >
                        Open player
                      </button>
                      <ReleaseScreenButton onClick={() => releaseScreen(selected.id)} />
                    </div>
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
        media={previewScreen && <ScreenThumb playing={previewScreen.playing} bare />}
        meta={
          previewScreen
            ? [
                <StatusPill key="status" screen={previewScreen} />,
                <span key="playlist">
                  Playlist{" "}
                  <span className="text-text-primary">
                    {previewScreen.playing ? previewScreen.playing.playlist : "Nothing scheduled"}
                  </span>
                </span>,
                ...(previewScreen.playing
                  ? [
                      <span key="item">
                        Item <span className="text-text-primary">{previewScreen.playing.item} · {previewScreen.playing.pos}</span>
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
        onOpenChange={(o) => !o && setModal(null)}
        screen={modal?.mode === "take" ? modalScreen : null}
        ack={ack}
        onAckToggle={() => setAck((v) => !v)}
        onConfirm={confirmTakeOver}
      />

      <RemoveConfirmModal
        open={modal?.mode === "remove"}
        onOpenChange={(o) => !o && setModal(null)}
        icon={Trash2}
        title={modal?.mode === "remove" ? `Remove ${modalScreen?.name}?` : ""}
        description="It's unpaired from your account and frees one of your 3 slots. To use it again, pair it with a new code."
        confirmLabel="Remove screen"
        onConfirm={() => modalScreen && removeScreen(modalScreen.id)}
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
// screen, and
// explicitly "take over" a screen (disconnects it, since only one
// connection per screen is ever allowed — see z-files/future-
// implementations.md's Preview-tab section for the full reasoning).
// UI-only for now: screens/pairing/take-over all live in local state with
// a short fake "Pairing…" delay — no backend wired yet (none exists for
// this feature yet).
// Used by: App.jsx (route "/player", inside Layout/ProtectedRoute — not to
// be confused with pages/Player.jsx, the unauthenticated device-facing
// "/player/:deviceId" route a real paired screen uses).
