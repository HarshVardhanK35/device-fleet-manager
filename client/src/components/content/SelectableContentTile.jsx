import ContentTile from "./ContentTile.jsx";
import SelectCheckbox from "../ui/SelectCheckbox.jsx";
import { useLongPress } from "../../hooks/useLongPress.js";

function SelectableContentTile({
  item,
  checked,
  inspected,
  dimmed,
  selectionMode,
  onToggleSelect,
  onOpen,
}) {
  // Touch: a long press selects the tile (there is no hover to reveal the
  // checkbox). Once anything is selected, a tap selects / unselects instead of
  // opening the details panel.
  const { handlers, consumeClick } = useLongPress(() => onToggleSelect(item._id));

  function handleClick(e) {
    if (consumeClick()) return;
    if (selectionMode) {
      onToggleSelect(item._id);
    } else {
      onOpen(item, e?.currentTarget?.getBoundingClientRect?.());
    }
  }

  return (
    <ContentTile
      item={item}
      size="fluid"
      coloredType
      onClick={handleClick}
      rootProps={handlers}
      className={`select-none [-webkit-touch-callout:none] transition-[filter,opacity] duration-200 ${
        dimmed ? "xl:blur-[3px] xl:opacity-60" : ""
      } ${
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
// details panel (gray border while it is the open one; the other tiles blur
// on desktop while it is open); the hover-reveal
// checkbox top-left selects (blue border). While anything is selected a click
// or tap toggles instead of opening, and every checkbox stays visible; on touch
// a long press starts the selection. `onToggleSelect(id, event?)` and `onOpen(item)` come
// from the parent (`onOpen` also gets the tile's on-screen rectangle). Used by: pages/Content.jsx.
