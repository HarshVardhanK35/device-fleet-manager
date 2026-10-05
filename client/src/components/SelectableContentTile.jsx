import ContentTile from "./ContentTile.jsx";
import SelectCheckbox from "./SelectCheckbox.jsx";

function SelectableContentTile({ item, checked, inspected, onToggleSelect, onClick }) {
  return (
    <ContentTile
      item={item}
      size="fluid"
      coloredType
      onClick={onClick}
      className={
        checked
          ? "!border-2 !border-accent-blue -translate-y-0.5"
          : inspected
            ? "!border-2 !border-[#8b949e] -translate-y-0.5"
            : ""
      }
    >
      <SelectCheckbox
        checked={checked}
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

// A ContentTile wired up for the Content library grid's bulk-selection +
// inspector-open states: blue border when checked, gray border when it's the
// item currently open in the inspector, hover-reveal square checkbox
// top-left. `onToggleSelect(id, event)` and `onClick()` are passed straight
// from the parent's selection/inspector state handlers.
// Used by: pages/Content.jsx.
