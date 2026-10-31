import { useState } from "react";

import { createContent, updateContent } from "../../api/content.js";

// Apps have no duration field in their own settings screen yet (unlike
// image/video, which have one) — backend requires durationInMillis for
// type "app" with no default, so this is a placeholder until a real
// duration control is built.
const APP_DEFAULT_DURATION_MS = 60000;

// `existingContent` (a Content document) means a settings screen is editing
// an already-saved app tile, opened via its tile's pencil icon — form state
// starts from its configBlob instead of the defaults. Generic over
// whatever fields `initialForm` declares — no per-field hand-listing, so a
// new field added to an app's INITIAL_FORM is automatically restored here
// too, nothing to remember to keep in sync.
function formFromContent(existingContent, initialForm) {
  if (!existingContent) return initialForm;
  const blob = existingContent.configBlob || {};
  return Object.fromEntries(
    Object.keys(initialForm).map((key) => [key, blob[key] ?? initialForm[key]]),
  );
}

// Shared by every app's settings screen (weather-modal.jsx, clock-modal.jsx,
// and any future one) — the save flow, dirty-check, and form-state
// bookkeeping are identical across apps; only the field layout and each
// app's own previewConfig shape differ, and that stays in each app's own
// file.
//
// `open`/`onOpenChange` are passed straight through from the caller, same
// as before — a fresh form on every open comes from OUTSIDE this hook:
// the caller gives its screen component a `key` that changes between
// open/closed/edit-target, so React fully remounts it (throwing away all
// hook state) each time, instead of this hook having to reset itself.
export function useAppSettingsForm({
  appType,
  initialForm,
  defaultAppName,
  existingContent,
  onSaved,
  onOpenChange,
  // Most apps show one static screen, so a flat default duration is fine.
  // An app whose actual on-screen time varies with its own settings (e.g.
  // RSS: item count × per-item dwell time) passes this to compute a real
  // value instead — see rss-modal.jsx. It also receives the saved tile, so an
  // app whose duration the user edits in the Content pane can keep it.
  computeDuration,
}) {
  // `base` is the last-saved snapshot; comparing `form` against it is what
  // drives the Save button's enabled/disabled state (dirty-check pattern).
  const [base, setBase] = useState(() => formFromContent(existingContent, initialForm));
  const [form, setForm] = useState(() => formFromContent(existingContent, initialForm));
  const [appName, setAppName] = useState(existingContent?.name ?? defaultAppName);
  // Set from the start when editing an existing row (so the very first
  // Save updates it) — otherwise set once the first Save succeeds, so a
  // later Save in the same session updates instead of creating a new one.
  const [contentId, setContentId] = useState(existingContent?._id ?? null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // One whole-object comparison instead of a per-key loop — works
  // uniformly for primitive, object, and array fields alike (a plain `!==`
  // loop breaks on arrays/objects unless the caller special-cases them).
  const dirty = JSON.stringify(form) !== JSON.stringify(base);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: appName,
        type: "app",
        durationInMillis: computeDuration ? computeDuration(form, existingContent) : APP_DEFAULT_DURATION_MS,
        configBlob: { ...form, appType },
      };

      const saved = contentId
        ? await updateContent(contentId, payload)
        : await createContent(payload);

      setContentId(saved._id);
      setBase(form);
      onSaved?.();
      return true;
    } catch {
      setSaveError("Couldn't save — check your connection and try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndClose() {
    const ok = await handleSave();
    if (ok) onOpenChange(false);
  }

  return {
    form,
    setForm,
    set,
    dirty,
    appName,
    setAppName,
    saving,
    saveError,
    handleSave,
    handleSaveAndClose,
    contentId,
  };
}
