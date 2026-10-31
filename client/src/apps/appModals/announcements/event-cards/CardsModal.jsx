import { useEffect, useState } from "react";
import { Image as ImageIcon, Trash2, Type } from "lucide-react";

import ColumnModal, { FieldLabel, ManagedForm } from "../../../shared/columnModal/ColumnModal.jsx";
import { INPUT_CLASS, TEXTAREA_CLASS } from "../../../shared/columnModal/columnModalStyles.js";
import SliderField from "../../../shared/SliderField.jsx";
import ToggleSwitch from "../../../shared/ToggleSwitch.jsx";
import BackgroundAudioField from "../../../shared/BackgroundAudioField.jsx";
import StyledSelect from "../../../../components/StyledSelect.jsx";
import ContentPickerModal from "../../../../components/ContentPickerModal.jsx";
import { AUDIO_OPTIONS } from "../common/audioOptions.js";
import { TYPE_ICON } from "./eventCardsIcons.js";
import {
  MAX_CARDS,
  TITLE_CAP,
  SUB_CAP,
  MESSAGE_CAP,
  DURATION_MIN,
  DURATION_MAX,
  CARD_TYPES,
  TYPE_META,
  FONTS,
} from "./eventCardsConfig.js";

const TYPE_OPTIONS = CARD_TYPES.map((t) => ({ value: t, label: TYPE_META[t].label }));

// "Add card" / "Edit card" — Event Cards' column-anchored modal, form only.
// The cards list itself lives in the settings panel's Cards card
// (CardsSection.jsx); `list` is that section's list state (draft, editing…).
function CardsModal({ layerEl, list, count, onClose, onModalOpenChange, portalContainer, library }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  // Coordinates the two dropdowns in the form — opening one closes the other.
  const [openField, setOpenField] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  const { draft, patch, focusRef, editing } = list;
  const meta = TYPE_META[draft.type];

  useEffect(() => {
    focusRef.current?.focus();
  }, [focusRef]);

  // A card starts on its type's recommended font; switching type moves it to
  // the new type's recommendation unless the user already picked another one.
  function setType(type) {
    const wasRecommended = draft.font === TYPE_META[draft.type].recommendedFont;
    patch({ type, font: wasRecommended ? TYPE_META[type].recommendedFont : draft.font });
  }

  const imageLibrary = library.filter((c) => c.type === "image");
  const recommended = meta.recommendedFont;
  const fontOptions = FONTS.map((f) => ({
    value: f.name,
    label: `${f.name} · ${f.mood}${f.name === recommended ? " (recommended)" : ""}`,
  }));
  const fontTip =
    draft.font === recommended
      ? "Recommended font applied"
      : `Recommended for ${meta.label}: ${recommended}`;

  return (
    <ColumnModal
      layerEl={layerEl}
      title={editing ? "Edit card" : "Add card"}
      count={count}
      max={MAX_CARDS}
      onClose={onClose}
      onModalOpenChange={onModalOpenChange}
      // Esc belongs to the image picker first while it's open.
      onEscape={() => pickerOpen}
      scrollbarClass="dark-scrollbar-thin"
    >
      <ManagedForm
        list={list}
        addLabel="Add card"
        limitText={`Maximum of ${MAX_CARDS} cards reached. Delete one to add more.`}
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-text-primary">Card type</span>
          <StyledSelect
            value={draft.type}
            onChange={setType}
            options={TYPE_OPTIONS}
            icon={TYPE_ICON[draft.type]}
            label="Card type"
            portalContainer={portalContainer}
            bgClassName="bg-bg-primary"
            collapseOnMobile={false}
            matchTriggerWidth
            open={openField === "type"}
            onOpenChange={(o) => setOpenField(o ? "type" : null)}
          />
        </div>

        <label className="flex flex-col gap-1.5">
          <FieldLabel
            label={meta.title.label}
            hint={`Required · ${draft.title.length}/${TITLE_CAP}`}
            hintClass={draft.title.length >= TITLE_CAP ? "text-accent-amber" : "text-text-muted"}
          />
          <input
            ref={focusRef}
            type="text"
            value={draft.title}
            maxLength={TITLE_CAP}
            placeholder={meta.title.placeholder}
            autoComplete="off"
            onChange={(e) => patch({ title: e.target.value.slice(0, TITLE_CAP) })}
            className={INPUT_CLASS}
          />
        </label>

        {meta.sub && (
          <label className="flex flex-col gap-1.5">
            <FieldLabel
              label={meta.sub.label}
              hint={`${meta.sub.required ? "Required" : "Optional"} · ${draft.sub.length}/${SUB_CAP}`}
              hintClass={draft.sub.length >= SUB_CAP ? "text-accent-amber" : "text-text-muted"}
            />
            <input
              type="text"
              value={draft.sub}
              maxLength={SUB_CAP}
              placeholder={meta.sub.placeholder}
              autoComplete="off"
              onChange={(e) => patch({ sub: e.target.value.slice(0, SUB_CAP) })}
              className={INPUT_CLASS}
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <FieldLabel
            label={meta.message.label}
            hint={`Optional · ${draft.message.length}/${MESSAGE_CAP}`}
            hintClass={draft.message.length >= MESSAGE_CAP ? "text-accent-amber" : "text-text-muted"}
          />
          <textarea
            rows={3}
            value={draft.message}
            maxLength={MESSAGE_CAP}
            placeholder={meta.message.placeholder}
            onChange={(e) => patch({ message: e.target.value.slice(0, MESSAGE_CAP) })}
            className={TEXTAREA_CLASS}
          />
        </label>

        <label
          className="flex flex-col gap-1.5"
          title="Optional. The badge on the card updates itself every day (Tomorrow, Today…). A future date is fine."
        >
          <FieldLabel label={meta.dateLabel} hint="Optional" />
          <input
            type="date"
            value={draft.eventDate}
            onChange={(e) => patch({ eventDate: e.target.value })}
            className={`${INPUT_CLASS} [color-scheme:dark]`}
          />
        </label>

        <div className="flex flex-col gap-1.5" title={fontTip}>
          <span className="text-[13px] font-semibold text-text-primary">Font family</span>
          <StyledSelect
            value={draft.font}
            onChange={(v) => patch({ font: v })}
            options={fontOptions}
            icon={Type}
            label="Font family"
            portalContainer={portalContainer}
            bgClassName="bg-bg-primary"
            collapseOnMobile={false}
            matchTriggerWidth
            open={openField === "font"}
            onOpenChange={(o) => setOpenField(o ? "font" : null)}
          />
        </div>

        <div className="flex flex-col gap-2.5 border border-border-muted rounded-lg p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-text-primary">Add image</span>
            <ToggleSwitch checked={draft.showImage} onChange={(v) => patch({ showImage: v })} />
          </div>
          {draft.showImage &&
            (draft.image ? (
              <div className="flex items-center gap-2 px-2 h-11 rounded-lg border border-border-muted bg-bg-primary">
                <span className="flex-1 min-w-0 truncate text-sm text-text-primary">
                  {draft.image.name || "Selected image"}
                </span>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="px-2.5 h-7 rounded-md border border-border-muted text-xs font-medium text-text-primary hover:bg-bg-hover transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => patch({ image: null })}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-border-muted text-text-muted hover:bg-bg-hover hover:text-accent-red transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex items-center justify-center gap-2 px-3 h-10 rounded-lg border border-dashed border-border-muted hover:border-border-hover bg-bg-primary text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                <ImageIcon size={14} />
                Choose from library
              </button>
            ))}
        </div>

        <SliderField
          label="Duration"
          value={draft.duration}
          onChange={(v) => patch({ duration: v })}
          min={DURATION_MIN}
          max={DURATION_MAX}
          step={1}
          suffix="s"
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-text-primary">Background audio</span>
          <BackgroundAudioField
            options={AUDIO_OPTIONS}
            value={draft.audio}
            onChange={(v) => {
              patch({ audio: v });
              setAudioPlaying(false);
            }}
            playing={audioPlaying}
            onTogglePlay={() => setAudioPlaying((p) => !p)}
            muted={audioMuted}
            onToggleMute={() => setAudioMuted((m) => !m)}
            portalContainer={portalContainer}
            open={openField === "audio"}
            onOpenChange={(o) => setOpenField(o ? "audio" : null)}
          />
        </div>
      </ManagedForm>

      <ContentPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        content={imageLibrary}
        title="Choose an image"
        subtitle="Pick an image from your content library"
        submitLabel="Use this image"
        showNameField={false}
        showTypeFilter={false}
        singleSelect
        initialSelectedIds={draft.image?.contentId ? [draft.image.contentId] : []}
        onSubmit={(_name, _description, selectedIds) => {
          const picked = imageLibrary.find((c) => c._id === selectedIds[0]);
          if (picked) {
            patch({ image: { url: picked.mediaUrl, name: picked.name, contentId: picked._id } });
          }
          setPickerOpen(false);
        }}
      />
    </ColumnModal>
  );
}

export default CardsModal;

// Used by: CardsSection.jsx.
