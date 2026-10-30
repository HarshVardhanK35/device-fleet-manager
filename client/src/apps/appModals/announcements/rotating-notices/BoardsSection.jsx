import { useState } from "react";
import { LayoutList } from "lucide-react";

import SettingsCard from "../../../shared/SettingsCard.jsx";
import BoardsModal from "./BoardsModal.jsx";
import { MAX_BOARDS } from "./rotatingNoticesConfig.js";

const SUMMARY_COUNT = 3;

// The "Boards" settings card — a short summary plus a button that opens the
// column-anchored "Manage boards" modal, so adding boards never grows the
// settings panel. Same pattern as Status List's ProductsSection.
function BoardsSection({ form, setForm, layerContainer, onDraftChange, onModalOpenChange }) {
  const [managing, setManaging] = useState(false);
  const boards = form.boards;

  return (
    <>
      <SettingsCard kicker={`Boards (${boards.length} / ${MAX_BOARDS})`}>
        <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
          {boards.length === 0 && <li className="text-[13px] text-text-muted">No boards yet</li>}
          {boards.slice(0, SUMMARY_COUNT).map((b, i) => (
            <li key={b.id} className="flex items-center gap-2 min-w-0 text-[13px] text-text-primary">
              <span className="flex-1 min-w-0 truncate">{b.name.trim() || `Board ${i + 1}`}</span>
              <span className="flex-none text-xs text-text-muted tabular-nums">{b.duration}s</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setManaging(true)}
          className="flex items-center justify-center gap-2 h-10 text-sm font-semibold text-text-primary bg-bg-primary border border-border-muted hover:border-border-hover hover:bg-bg-hover rounded-lg px-3 transition-colors"
        >
          <LayoutList size={16} />
          Manage boards
        </button>
      </SettingsCard>

      {managing && (
        <BoardsModal
          layerEl={layerContainer}
          boards={boards}
          setForm={setForm}
          onClose={() => setManaging(false)}
          onDraftChange={onDraftChange}
          onModalOpenChange={onModalOpenChange}
        />
      )}
    </>
  );
}

export default BoardsSection;

// Used by: RotatingNoticesSettings.jsx.
