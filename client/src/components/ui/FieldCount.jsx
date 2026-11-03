// "42 / 60": how much of a field's character limit is used. Turns amber at
// the limit. Sits in the label row above an input that has `maxLength`.
// Used by: content/ContentDetailsPanel.jsx, content/ContentPickerModal.jsx,
// playlists/EditPlaylistModal.jsx, pages/PlayerSlots.jsx.
function FieldCount({ value = "", max }) {
  return (
    <span
      className={`text-[11px] font-normal tabular-nums ${
        value.length >= max ? "text-accent-amber" : "text-text-muted"
      }`}
    >
      {value.length} / {max}
    </span>
  );
}

export default FieldCount;
