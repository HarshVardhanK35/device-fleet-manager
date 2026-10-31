import { useManagedList } from "../../../shared/columnModal/useManagedList.js";
import {
  MAX_CARDS,
  TITLE_CAP,
  SUB_CAP,
  MESSAGE_CAP,
  DURATION_MIN,
  TYPE_META,
  newCard,
} from "./eventCardsConfig.js";

export const EMPTY_FORM = {
  type: "birthday",
  title: "",
  sub: "",
  message: "",
  eventDate: "",
  font: TYPE_META.birthday.recommendedFont,
  showImage: false,
  image: null,
  duration: DURATION_MIN,
  audio: "None",
};

// The cards list + the add / edit form state, shared by the Cards card (which
// shows and manages the list) and the "Add card" modal (which only renders
// the form). `onSubmitted` runs after a successful Add / Save changes — the
// section closes the modal there.
export function useCardsList({ cards, setForm, onDraftChange, onSubmitted }) {
  return useManagedList({
    listKey: "cards",
    items: cards,
    setForm,
    max: MAX_CARDS,
    emptyForm: EMPTY_FORM,
    clean: (d) => ({
      type: d.type,
      title: d.title.trim().replace(/\s+/g, " ").slice(0, TITLE_CAP),
      sub: d.sub.trim().slice(0, SUB_CAP),
      message: d.message.trim().slice(0, MESSAGE_CAP),
      eventDate: d.eventDate,
      font: d.font,
      showImage: d.showImage,
      image: d.image,
      duration: d.duration,
      audio: d.audio,
    }),
    // Every type needs its title; Congratulations also needs its achievement.
    canSubmit: (v) => Boolean(v.title && (v.type !== "congrats" || v.sub)),
    newEntity: newCard,
    toDraft: (c) => ({
      type: c.type,
      title: c.title,
      sub: c.sub,
      message: c.message,
      eventDate: c.eventDate,
      font: c.font,
      showImage: c.showImage,
      image: c.image,
      duration: c.duration,
      audio: c.audio ?? "None",
    }),
    previewDraft: ({ editing, editingId, values, full }) => {
      if (editing) return { mode: "editing", id: editingId, ...values };
      if ((values.title || values.sub || values.message) && !full) return { mode: "draft", ...values };
      return null;
    },
    onSubmitted,
    onDraftChange,
  });
}
