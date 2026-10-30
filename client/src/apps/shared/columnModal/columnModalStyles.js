// Class strings shared by every column-anchored modal's form fields and
// row buttons. Kept out of ColumnModal.jsx (a component file can only export
// components, per ESLint's react-refresh rule).

const FIELD_CLASS =
  "w-full bg-bg-primary border border-border-muted hover:border-border-hover focus:border-accent-blue focus:shadow-[0_0_0_3px_rgba(47,129,247,.3)] rounded-lg px-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-muted";

export const INPUT_CLASS = `${FIELD_CLASS} h-10 lg:h-9`;
export const TEXTAREA_CLASS = `${FIELD_CLASS} py-2 resize-none dark-scrollbar`;

// Row edit / delete icon buttons (40px touch targets below lg, 28px above).
export const ICON_BTN =
  "w-10 h-10 lg:w-7 lg:h-7 grid place-items-center flex-none rounded-md text-text-muted transition-colors";

// Inline Yes / No buttons (delete confirm, clear-all confirm).
export const CONFIRM_YES =
  "h-10 lg:h-7 px-2.5 rounded-md bg-accent-red hover:bg-[#f25d80] text-white text-[13px] font-semibold transition-colors";
export const CONFIRM_NO =
  "h-10 lg:h-7 px-2.5 rounded-md border border-border-muted hover:bg-bg-hover text-text-primary text-[13px] font-semibold transition-colors";
