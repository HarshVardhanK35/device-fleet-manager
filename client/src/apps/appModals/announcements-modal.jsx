import { useState } from "react";
import { Bell, List, PartyPopper, Lock, ChevronDown, ChevronUp } from "lucide-react";

import AppSettingsShell from "../shared/AppSettingsShell.jsx";
import AppPreviewFrame from "../shared/AppPreviewFrame.jsx";
import { resolveAppUrlByName } from "../resolveAppUrl.js";
import { useAppSettingsForm } from "../shared/useAppSettingsForm.js";
import RotatingNoticesFields from "./announcements/rotating-notices/RotatingNoticesSettings.jsx";
import {
  ROTATING_NOTICES_INITIAL_FORM,
  computeRotatingNoticesDuration,
} from "./announcements/rotating-notices/rotatingNoticesConfig.js";
// StatusListFields / EventCardsFields: scaffolded, not integrated yet — add
// to TEMPLATES below once each one's own integration pass happens.

const ANNOUNCEMENTS_APP_URL = resolveAppUrlByName("Announcements");

const TEMPLATES = {
  "rotating-notices": {
    name: "Rotating Notices",
    icon: Bell,
    available: true,
    initialForm: ROTATING_NOTICES_INITIAL_FORM,
    computeDuration: computeRotatingNoticesDuration,
    Fields: RotatingNoticesFields,
  },
  "status-list": { name: "Status List", icon: List, available: false },
  "event-cards": { name: "Event/Celebration Cards", icon: PartyPopper, available: false },
};
const TEMPLATE_ORDER = ["rotating-notices", "status-list", "event-cards"];

// The 3-button row living at the top of the settings panel itself (not the
// modal header) — clicking an available template swaps the settings
// content below it, in the same modal. Replaces an earlier separate
// full-screen "Choose a template" picker, then an earlier header-row
// placement, both dropped per the 2026-10-29 design correction (Harsha:
// no separate selection screen, and it belongs inside the settings panel).
function TemplateSelector({ template, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      {TEMPLATE_ORDER.map((id) => {
        const t = TEMPLATES[id];
        const selected = template === id;
        return (
          <button
            key={id}
            type="button"
            disabled={!t.available}
            title={t.available ? t.name : `${t.name} — coming soon`}
            onClick={() => t.available && onChange(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              selected
                ? "border-accent-blue bg-accent-blue/15 text-accent-blue"
                : t.available
                  ? "border-border-muted text-text-primary hover:bg-bg-hover hover:border-border-hover"
                  : "border-border-muted text-text-muted/50 cursor-not-allowed"
            }`}
          >
            <t.icon size={14} className="flex-none" />
            <span className="flex-1 text-left">{t.name}</span>
            {!t.available && <Lock size={11} className="flex-none" />}
          </button>
        );
      })}
    </div>
  );
}

// A SettingsCard-styled container, but with a clickable kicker row (same
// chevron treatment as a board's accordion header) that collapses the
// template list once a pick is made — matching the kicker label with the
// selected template's own name instead of a flat "Template" label while
// collapsed, so it's clear at a glance what's active.
function TemplateCard({ open, onToggle, template, onChange }) {
  return (
    <div className="flex flex-col bg-bg-panel border border-border-muted rounded-lg overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        }}
        className="flex items-center gap-2 p-2 text-left cursor-pointer"
      >
        <span className="flex-1 text-[11px] font-semibold tracking-wide uppercase text-accent-blue">
          {open ? "Template" : TEMPLATES[template].name}
        </span>
        <span className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors flex-none">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>
      {open && (
        <div className="px-3.5 pb-3.5">
          <TemplateSelector template={template} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

// Owns the actual save/dirty/preview machinery for whichever template is
// selected. Keyed by `template` from the caller below — switching templates
// remounts this (fresh form state per template), same remount-on-key-change
// pattern already used across this codebase (e.g. Content.jsx keying each
// app's settings screen by open/edit-target).
function AnnouncementsBody({
  template,
  onTemplateChange,
  templateOpen,
  onToggleTemplateOpen,
  open,
  onOpenChange,
  onSaved,
  existingContent,
}) {
  const { name: defaultAppName, initialForm, computeDuration, Fields } = TEMPLATES[template];

  const {
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
  } = useAppSettingsForm({
    appType: "announcements",
    initialForm,
    defaultAppName,
    existingContent,
    onSaved,
    onOpenChange,
    computeDuration,
  });

  return (
    <AppSettingsShell
      open={open}
      onOpenChange={onOpenChange}
      appName={appName}
      onAppNameChange={setAppName}
      dirty={dirty}
      onSaveAndClose={handleSaveAndClose}
      onSaveOnly={handleSave}
      saving={saving}
      saveError={saveError}
      preview={(previewSize, fullPreview) => (
        <AppPreviewFrame
          size={previewSize}
          src={ANNOUNCEMENTS_APP_URL}
          config={form}
          fullscreen={fullPreview}
        />
      )}
    >
      {(portalContainer) => (
        <>
          <TemplateCard
            open={templateOpen}
            onToggle={onToggleTemplateOpen}
            template={template}
            onChange={onTemplateChange}
          />
          <Fields form={form} setForm={setForm} set={set} portalContainer={portalContainer} />
        </>
      )}
    </AppSettingsShell>
  );
}

// Entry point for the Announcements app's settings screen — one modal, a
// template-selector row inside its header, settings+preview for whichever
// template is picked underneath. An already-saved tile reopens straight to
// its saved template (configBlob.template); a new tile defaults to
// Rotating Notices, the only template integrated so far.
function AnnouncementsSettingsScreen({ open, onOpenChange, onSaved, existingContent }) {
  const [template, setTemplate] = useState(
    existingContent?.configBlob?.template ?? "rotating-notices",
  );
  // Owned here, not inside AnnouncementsBody — AnnouncementsBody remounts on
  // every template switch (see its `key` below), which would otherwise
  // reset this back to its initial value on every pick instead of staying
  // collapsed after one.
  const [templateOpen, setTemplateOpen] = useState(true);

  function handleTemplateChange(id) {
    setTemplate(id);
    setTemplateOpen(false);
  }

  return (
    <AnnouncementsBody
      // Remounts AnnouncementsBody on template switch — fresh form state
      // per template, same remount-on-key-change pattern used throughout
      // this codebase (e.g. Content.jsx keying each app's settings screen
      // by open/edit-target). Only one template is available to switch to
      // today, so this never actually fires yet — revisit with a
      // confirm-discard-changes step (checking `dirty`) once Status List/
      // Event Cards are integrated and switching mid-edit becomes real.
      key={template}
      template={template}
      onTemplateChange={handleTemplateChange}
      templateOpen={templateOpen}
      onToggleTemplateOpen={() => setTemplateOpen((v) => !v)}
      open={open}
      onOpenChange={onOpenChange}
      existingContent={existingContent}
      onSaved={onSaved}
    />
  );
}

export default AnnouncementsSettingsScreen;

// Used by: pages/Content.jsx (wired from AppsPickerModal's onSelectApp and
// ContentDetailsPanel's "Edit app settings" button, same as Weather/Clock/
// RSS) — Content.jsx only needs ONE open/editTarget state pair for
// Announcements; the template routing above happens inside this file.
