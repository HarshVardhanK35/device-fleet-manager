import ContentTile from "./ContentTile.jsx";
import SelectCheckbox from "./SelectCheckbox.jsx";
import { useLongPress } from "../hooks/useLongPress.js";

function SelectableContentTile({
  item,
  checked,
  inspected,
  selectionMode,
  onToggleSelect,
  onOpen,
}) {
  // Touch: a long press selects the tile (there is no hover to reveal the
  // checkbox). Once anything is selected, a tap selects / unselects instead of
  // opening the details panel.
  const { handlers, consumeClick } = useLongPress(() => onToggleSelect(item._id));

  function handleClick() {
    if (consumeClick()) return;
    if (selectionMode && window.matchMedia("(pointer: coarse)").matches) {
      onToggleSelect(item._id);
    } else {
      onOpen(item);
    }
  }

  return (
    <ContentTile
      item={item}
      size="fluid"
      coloredType
      onClick={handleClick}
      rootProps={handlers}
      className={`select-none [-webkit-touch-callout:none] ${
        checked
          ? "!border-2 !border-accent-blue -translate-y-0.5"
          : inspected
            ? "!border-2 !border-[#8b949e] -translate-y-0.5"
            : ""
      }`}
    >
      <SelectCheckbox
        checked={checked}
        alwaysVisible={selectionMode}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(item._id, e);
        }}
        className="absolute left-1.5 top-1.5 z-10"
      />
    </ContentTile>
  );
}

export default SelectableContentTile;

// A ContentTile wired up for the Content library grid: click opens the
// details panel (gray border while it is the open one); the hover-reveal
// checkbox top-left selects (blue border). On touch, a long press selects and
// — while anything is selected — a tap toggles instead of opening, and every
// checkbox stays visible. `onToggleSelect(id, event?)` and `onOpen(item)` come
// from the parent. Used by: pages/Content.jsx.
