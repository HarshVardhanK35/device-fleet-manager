import { useState, useEffect, useRef } from "react";

import { claimPairingCode } from "../api/pairing.js";
import {
  getDevices,
  updateDevice,
  deleteDevice,
  takeOverDevice,
  releaseDevice,
  refreshDevice,
} from "../api/devices.js";
import { getAssignments } from "../api/assignments.js";
import { useToast } from "../context/useToast.js";
import { MAX_SCREENS } from "../utils/limits.js";
import { PAIRING_CODE_LENGTH, computePlaying, mapDevice } from "../utils/screenSlots.js";

// Everything the Player page knows and does: the account's screens (up to 3
// slots, one of them possibly still waiting to be paired), which one is
// selected, pairing with a code, editing the name and type, removing,
// taking over and releasing, and the modal that is open.
export function useScreenSlots() {
  const toast = useToast();
  const [screens, setScreens] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mobileView, setMobileView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const nameInputRef = useRef(null);
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
  // "Refresh screen": when each screen may be refreshed again (ms), and a
  // clock that ticks every second while any of them is counting down.
  const [refreshUntil, setRefreshUntil] = useState({});
  const [clock, setClock] = useState(() => Date.now());
  const refreshWaiting = Object.values(refreshUntil).some((until) => until > clock);

  useEffect(() => {
    if (!refreshWaiting) return undefined;
    const t = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(t);
  }, [refreshWaiting]);

  async function fetchMappedScreens() {
    const [devicesData, assignmentsData] = await Promise.all([
      getDevices(),
      getAssignments(),
    ]);
    const assignments = Array.isArray(assignmentsData) ? assignmentsData : [];
    return Array.isArray(devicesData)
      ? devicesData.map((d) => mapDevice(d, computePlaying(assignments, d._id)))
      : [];
  }

  // Manual refresh: fresh data from the server, keeping the selection (and any
  // slot still waiting to be paired, which only exists locally).
  async function refreshScreens() {
    const mapped = await fetchMappedScreens();
    setScreens((prev) => [...mapped, ...prev.filter((s) => s.pending)]);
    setSelectedId((id) =>
      mapped.some((s) => s.id === id) || screens.some((s) => s.id === id && s.pending)
        ? id
        : (mapped[0]?.id ?? null),
    );
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mapped = await fetchMappedScreens();
      if (cancelled) return;
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

  // The code typed for a slot that is waiting to be paired, and its error.
  const codeFor = (id) => codes[id] || "";
  const pairErrorFor = (id) => pairErrors[id] || "";

  function changeCode(id, value) {
    setPairErrors((prev) => ({ ...prev, [id]: "" }));
    setCodes((prev) => ({
      ...prev,
      [id]: value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, PAIRING_CODE_LENGTH),
    }));
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
    // The Name field is far below the fold on a phone, so bring it into view
    // and put the cursor there. A short delay lets the actions menu finish
    // closing first — it hands focus back to its own button when it does.
    setTimeout(() => {
      const el = nameInputRef.current;
      if (!el) return;
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.focus({ preventScroll: true });
      el.select();
    }, 150);
  }

  // Typing in the Name or Type field starts an edit of that screen.
  function changeDraft(id, field, value) {
    setEditingId(id);
    setDraft((d) => ({ ...d, [field]: value }));
  }

  function discardEdit() {
    setEditingId(null);
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
    if (!result || result.message !== "Screen deleted") {
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

  // Seconds until this screen may be refreshed again (0 = now).
  const refreshLeft = (id) => Math.max(0, Math.ceil(((refreshUntil[id] || 0) - clock) / 1000));

  function startRefreshWait(id, seconds) {
    setClock(Date.now());
    setRefreshUntil((prev) => ({ ...prev, [id]: Date.now() + seconds * 1000 }));
  }

  // "Refresh screen": the screen (if online) starts its playlist again from
  // the first item. The server allows one per screen per minute.
  async function refreshScreenNow(screen) {
    const result = await refreshDevice(screen.id);
    if (result?.message === "Refresh signal sent") {
      toast(`Refresh sent to ${screen.name}`);
      startRefreshWait(screen.id, result.retryInSeconds ?? 60);
      return;
    }
    if (result?.retryInSeconds) startRefreshWait(screen.id, result.retryInSeconds);
    toast(result?.message || "Couldn't refresh this screen. Try again.", "error");
  }

  function openTakeOver(id) {
    setModal({ mode: "take", id });
    setAck(false);
    setTakeOverError("");
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

  return {
    screens,
    loading,
    used,
    full,
    selected,
    selectedSlot,
    selectedId,
    mobileView,
    setMobileView,
    selectScreen,
    addScreen,
    refreshScreens,
    // pairing
    codeFor,
    pairErrorFor,
    changeCode,
    codeFocused,
    setCodeFocused,
    busyId,
    handlePair,
    cancelPairing,
    // editing
    editingId,
    draft,
    editError,
    nameInputRef,
    startEdit,
    changeDraft,
    discardEdit,
    saveEdit,
    // take over / release / remove and the modal that is open
    modal,
    setModal,
    modalScreen,
    previewScreen,
    ack,
    setAck,
    takeOverError,
    setTakeOverError,
    removeError,
    setRemoveError,
    releaseError,
    openTakeOver,
    refreshLeft,
    refreshScreenNow,
    confirmTakeOver,
    releaseScreen,
    removeScreen,
  };
}

// Used by: pages/PlayerSlots.jsx.
