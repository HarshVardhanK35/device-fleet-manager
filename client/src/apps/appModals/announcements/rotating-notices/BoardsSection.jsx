import { useState } from "react";
import { Plus } from "lucide-react";

import SettingsCard from "../../../shared/SettingsCard.jsx";
import Field from "../../../shared/Field.jsx";
import SegmentedControl from "../../../shared/SegmentedControl.jsx";
import SliderField from "../../../shared/SliderField.jsx";
import AccordionListItem from "../../../shared/AccordionListItem.jsx";
import { useDragReorder } from "../../../shared/useDragReorder.js";
import { newBoard } from "./rotatingNoticesConfig.js";
import Hint from "../common/Hint.jsx";

const TIERS = ["None", "Urgent", "Warning", "Info"];
const CHAR_CAP = { urgent: 60, warning: 80, info: 100 };
const MAX_BOARDS = 3;

// One tier's message field(s) — the always-present first message, plus a
// second only while this board's `tierWithTwo` picked this exact tier (spec
// section 1: only one tier per board may hold 2 messages).
function TierMessages({ tier, label, cap, board, onChange, autoFocusFirst }) {
  const values = board[tier];

  function setValue(i, text) {
    const next = values.slice();
    next[i] = text.slice(0, cap);
    onChange({ ...board, [tier]: next });
  }

  return (
    <div className="flex flex-col gap-2">
      {values.map((text, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-text-primary text-sm font-medium">
              {i === 0 ? `${label} message` : `${label} message #2`}
            </span>
            <span
              className={`text-[11px] ${
                text.length >= cap ? "text-accent-red" : "text-text-muted"
              }`}
            >
              {text.length} / {cap}
            </span>
          </div>
          <textarea
            rows={2}
            value={text}
            maxLength={cap}
            autoFocus={autoFocusFirst && i === 0}
            onChange={(e) => setValue(i, e.target.value)}
            className="dark-scrollbar w-full resize-none bg-bg-primary border border-border-muted hover:border-border-hover focus:border-accent-blue rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-colors"
          />
        </div>
      ))}
    </div>
  );
}

function BoardCard({
  board,
  index,
  canRemove,
  showDuration,
  onChange,
  onRemove,
  expanded,
  onToggle,
  dragProps,
  autoFocusUrgent,
}) {
  function setTierWithTwo(tier) {
    const next = { ...board, tierWithTwo: tier };
    // Switching which tier holds 2 messages — add a 2nd slot to the newly
    // picked tier, trim any other tier back to 1 (a board only ever has one
    // doubled tier at a time, per spec).
    ["urgent", "warning", "info"].forEach((t) => {
      const label = t[0].toUpperCase() + t.slice(1);
      if (label === tier && next[t].length === 1) next[t] = [...next[t], ""];
      if (label !== tier && next[t].length === 2) next[t] = [next[t][0]];
    });
    onChange(next);
  }

  return (
    <AccordionListItem
      title={`Board ${index + 1}`}
      canRemove={canRemove}
      onRemove={onRemove}
      expanded={expanded}
      onToggle={onToggle}
      dragProps={dragProps}
    >
      <Field label="Tier with 2 messages">
        <SegmentedControl
          options={TIERS}
          value={board.tierWithTwo}
          onChange={setTierWithTwo}
        />
      </Field>

      <TierMessages
        tier="urgent"
        label="Urgent"
        cap={CHAR_CAP.urgent}
        board={board}
        onChange={onChange}
        autoFocusFirst={autoFocusUrgent}
      />
      <TierMessages
        tier="warning"
        label="Warning"
        cap={CHAR_CAP.warning}
        board={board}
        onChange={onChange}
      />
      <TierMessages
        tier="info"
        label="Info"
        cap={CHAR_CAP.info}
        board={board}
        onChange={onChange}
      />

      {showDuration && (
        <SliderField
          label="Duration"
          value={board.duration}
          onChange={(v) => onChange({ ...board, duration: v })}
          min={5}
          max={60}
          step={1}
          suffix="s"
        />
      )}
    </AccordionListItem>
  );
}

// The "Boards" settings card — add/remove/reorder/edit up to MAX_BOARDS
// boards. Owns all board-list-local state itself (expand/collapse, drag
// state, which board was just added) — only talks to the rest of the form
// through `form.boards`/`setForm`.
function BoardsSection({ form, setForm }) {
  // Accordion — only one board expanded at a time, tracked by board id (not
  // index) so it stays pinned to the right board across drag-reordering.
  // Board 1 starts expanded.
  const [expandedId, setExpandedId] = useState(form.boards[0]?.id ?? null);
  // Set only right after "Add board" — the newly added board autofocuses
  // its Urgent field once, instead of every expand autofocusing it.
  const [justAddedId, setJustAddedId] = useState(null);

  function updateBoard(index, next) {
    setForm((prev) => ({
      ...prev,
      boards: prev.boards.map((b, i) => (i === index ? next : b)),
    }));
  }

  function addBoard() {
    const board = newBoard();
    setForm((prev) => ({ ...prev, boards: [...prev.boards, board] }));
    setExpandedId(board.id);
    setJustAddedId(board.id);
  }

  function removeBoard(index) {
    setForm((prev) => {
      const next = prev.boards.filter((_, i) => i !== index);
      if (prev.boards[index]?.id === expandedId)
        setExpandedId(next[0]?.id ?? null);
      return { ...prev, boards: next };
    });
  }

  const { dragPropsFor } = useDragReorder((from, to) => {
    setForm((prev) => {
      const next = prev.boards.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...prev, boards: next };
    });
  });

  return (
    <SettingsCard kicker="Boards">
      <Hint text="Collapse every board to drag and reorder them." />
      <div className="flex flex-col gap-3">
        {form.boards.map((board, i) => (
          <BoardCard
            key={board.id}
            board={board}
            index={i}
            canRemove={form.boards.length > 1}
            showDuration={form.boards.length > 1}
            onChange={(next) => updateBoard(i, next)}
            onRemove={() => removeBoard(i)}
            expanded={expandedId === board.id}
            onToggle={() =>
              setExpandedId((cur) => (cur === board.id ? null : board.id))
            }
            dragProps={{ ...dragPropsFor(i), draggable: expandedId === null }}
            autoFocusUrgent={justAddedId === board.id}
          />
        ))}
      </div>
      {form.boards.length < MAX_BOARDS && (
        <button
          type="button"
          onClick={addBoard}
          className="flex items-center justify-center gap-2 text-sm font-semibold text-text-primary bg-bg-primary border border-border-muted hover:border-border-hover hover:bg-bg-hover rounded-lg px-3 py-2 transition-colors"
        >
          <Plus size={14} />
          Add board
        </button>
      )}
    </SettingsCard>
  );
}

export default BoardsSection;

// Used by: RotatingNoticesSettings.jsx.
