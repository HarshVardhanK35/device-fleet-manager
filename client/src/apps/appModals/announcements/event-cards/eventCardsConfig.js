// Non-component pieces for the Event Cards template — kept apart from the
// components (a file mixing both breaks React Fast Refresh).
// Spec: z-announcement-designs/events/SPEC.md (§3.3 fonts, §8 effects, §9 data).

export const MAX_CARDS = 5;
export const TITLE_CAP = 50;
export const SUB_CAP = 60;
export const MESSAGE_CAP = 160;
// Same range as Rotating Notices' boards.
export const DURATION_MIN = 10;
export const DURATION_MAX = 60;

export const CARD_TYPES = ["birthday", "milestone", "welcome", "congrats", "holiday"];

// Each type's labels. Every card stores the same three fields — `title`,
// `sub`, `message` — and the type decides what they're called and whether
// `sub` is shown at all (so a name typed on a Birthday card is still there
// after switching it to Welcome).
export const TYPE_META = {
  birthday: {
    label: "Birthday",
    dateLabel: "Birthday date",
    recommendedFont: "Fredoka",
    title: { label: "Name", placeholder: "e.g. Maya Chen" },
    sub: null,
    message: { label: "Wish / message", placeholder: "A short wish from the team" },
  },
  milestone: {
    label: "Milestone",
    dateLabel: "Milestone date",
    recommendedFont: "Space Grotesk",
    title: { label: "Milestone title", placeholder: "e.g. 1 million deliveries" },
    sub: null,
    message: { label: "Description", placeholder: "What it means and who made it happen" },
  },
  welcome: {
    label: "Welcome",
    dateLabel: "Start date",
    recommendedFont: "Plus Jakarta Sans",
    title: { label: "Name", placeholder: "e.g. Priya Natarajan" },
    sub: { label: "Reason / role", placeholder: "e.g. Joining Design as Senior Designer", required: false },
    message: { label: "Welcome message", placeholder: "Where to find them, how to say hi" },
  },
  congrats: {
    label: "Congratulations",
    dateLabel: "Achievement date",
    recommendedFont: "Sora",
    title: { label: "Name", placeholder: "e.g. The Platform team" },
    sub: { label: "Achievement", placeholder: "e.g. Shipped v3.0 on schedule", required: true },
    message: { label: "Message", placeholder: "A note of thanks" },
  },
  holiday: {
    label: "Holiday",
    dateLabel: "Occasion date",
    recommendedFont: "Nunito",
    title: { label: "Occasion name", placeholder: "e.g. Lunar New Year" },
    sub: null,
    message: { label: "Description", placeholder: "Office hours, events, wishes" },
  },
};

// Spec §3.3 — the 10 card fonts and the mood shown beside each.
export const FONTS = [
  { name: "Plus Jakarta Sans", mood: "Warm, friendly" },
  { name: "Outfit", mood: "Modern geometric" },
  { name: "Sora", mood: "Confident" },
  { name: "Space Grotesk", mood: "Bold, distinctive" },
  { name: "Manrope", mood: "Clean, calm" },
  { name: "Fredoka", mood: "Rounded, joyful" },
  { name: "Nunito", mood: "Soft, festive" },
  { name: "Lexend", mood: "Highly legible" },
  { name: "Urbanist", mood: "Elegant, airy" },
  { name: "Figtree", mood: "Easygoing" },
];

// Spec §8 — the 18 effect switches, in groups. "Per card type" is built at
// render time: Icon motion always, plus the chip for each type in the rotation.
export const EFFECT_GROUPS = [
  {
    id: "ambient",
    label: "Ambient",
    effects: [
      { key: "glow", label: "Breathing glow", hint: "The background glow slowly breathes." },
      { key: "particles", label: "Floating particles", hint: "Soft dots float up behind the card." },
    ],
  },
  {
    id: "emphasis",
    label: "Emphasis",
    effects: [
      { key: "bigHead", label: "Larger headline", hint: "Makes the headline larger." },
      { key: "gradHead", label: "Gradient headline", hint: "Fills the headline with a colour gradient." },
      { key: "badge", label: "Badge chip", hint: "Shows a date chip above the heading (Today, Tomorrow…)." },
    ],
  },
];

export const ICON_MOTION_EFFECT = {
  key: "iconMotion",
  label: "Icon motion",
  hint: "The kicker icon moves in its own way on entry.",
};

// The one toggle that belongs to each card type. Birthday has none — its
// confetti is always on.
export const TYPE_EFFECT = {
  milestone: { key: "countUp", label: "Milestone count-up", hint: "Numbers in a Milestone title count up from 0." },
  welcome: { key: "welcomePop", label: "Welcome badge pop", hint: "The Welcome badge pops in." },
  congrats: { key: "congratsFx", label: "Congrats shine + fireworks", hint: "A shine sweep and fireworks on Congratulations cards." },
  holiday: { key: "holidayFx", label: "Holiday particles", hint: "Falling snowflakes and sparkles on Holiday cards." },
};

const ALL_EFFECT_KEYS = [
  ...EFFECT_GROUPS.flatMap((g) => g.effects.map((e) => e.key)),
  ICON_MOTION_EFFECT.key,
  ...Object.values(TYPE_EFFECT).map((e) => e.key),
];

export function newCard() {
  return {
    id: crypto.randomUUID(),
    type: "birthday",
    title: "",
    sub: "",
    message: "",
    // YYYY-MM-DD or "" — optional; may be in the future.
    eventDate: "",
    font: TYPE_META.birthday.recommendedFont,
    showImage: false,
    // { url, name, contentId } picked from the content library, or null.
    image: null,
    duration: DURATION_MIN,
    audio: "None",
  };
}

export const EVENT_CARDS_INITIAL_FORM = {
  template: "event-cards",
  theme: "dark",
  cards: [],
  effects: Object.fromEntries(ALL_EFFECT_KEYS.map((k) => [k, true])),
  // Explicit setting, never read from the OS (see Rotating Notices).
  reduceMotion: false,
};

// Total on-screen time = every card's own duration. An empty rotation falls
// back to one card's default so the saved content never has a zero duration.
export function computeEventCardsDuration(form) {
  const total = form.cards.reduce((sum, c) => sum + c.duration, 0);
  return (total || DURATION_MIN) * 1000;
}
