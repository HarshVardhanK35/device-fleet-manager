import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";

function StyledSelect({
  value,
  onChange,
  options,
  labelFor,
  icon: Icon,
  label,
  open,
  onOpenChange,
  roundedSide = "full",
  portalContainer,
  bgClassName = "bg-bg-panel",
  collapseOnMobile = true,
}) {
  const roundedClass =
    roundedSide === "left"
      ? "rounded-l-lg rounded-r-none"
      : roundedSide === "right"
        ? "rounded-r-lg rounded-l-none border-l-0"
        : "rounded-lg";
  const widthClass = collapseOnMobile ? "w-9 md:w-auto md:min-w-[140px]" : "w-full min-w-0";
  const padClass = collapseOnMobile ? "px-0 md:px-3" : "px-3";
  const justifyClass = collapseOnMobile
    ? "justify-center md:justify-between"
    : "justify-between";
  const iconHideClass = collapseOnMobile ? "md:hidden" : "hidden";
  const labelShowClass = collapseOnMobile ? "hidden md:inline" : "inline";
  const chevronShowClass = collapseOnMobile ? "hidden md:block" : "block";

  return (
    <Select.Root
      value={value}
      onValueChange={onChange}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Select.Trigger
        aria-label={label}
        className={`group inline-flex items-center ${justifyClass} gap-2 ${bgClassName} border border-border-muted hover:bg-bg-hover hover:border-border-hover text-text-primary text-sm ${widthClass} ${padClass} h-9 outline-none transition-colors focus-visible:border-accent-blue focus-visible:z-10 data-[state=open]:border-accent-blue data-[state=open]:z-10 ${roundedClass}`}
      >
        <Icon
          size={16}
          className={`${iconHideClass} text-text-muted group-hover:text-text-primary transition-colors`}
        />
        <span className={`${labelShowClass} truncate`}>
          <Select.Value />
        </span>
        <Select.Icon className={chevronShowClass}>
          <ChevronDown
            size={14}
            className="text-text-muted group-hover:text-text-primary transition-colors flex-none"
          />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal container={portalContainer}>
        <Select.Content
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
          className="bg-bg-panel border border-border-muted rounded-[10px] shadow-[0_8px_24px_rgba(1,4,9,0.55),0_1px_3px_rgba(1,4,9,0.4)] p-1 z-50 w-[180px] sm:w-[216px]"
        >
          <Select.Viewport className="dark-scrollbar">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-text-muted data-[highlighted]:bg-bg-hover data-[highlighted]:text-text-primary data-[state=checked]:text-text-primary cursor-pointer outline-none"
              >
                <Select.ItemText>
                  {labelFor ? labelFor(opt) : opt.label}
                </Select.ItemText>
                <Select.ItemIndicator className="ml-auto">
                  <Check size={14} className="text-accent-blue" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export default StyledSelect;

// Shared dark-themed Radix Select dropdown — NOT a native <select>, since a
// native select's expanded option list can't be restyled across browsers.
// Collapses to an icon-only 36px square below `md`; the dropdown content
// itself is unaffected, still showing full option labels. `options` is
// [{ value, label }]; `labelFor(opt)` (optional) overrides the displayed
// label per-item (e.g. to append a count). `open`/`onOpenChange` (optional)
// make it a controlled dropdown — pass these when a sibling control needs
// to force this one closed (e.g. ContentFilterSortBar's Filter/Sort pair,
// so opening one closes the other instead of both being open at once).
// Omit both to stay uncontrolled (Radix manages its own open state).
// `roundedSide` ("full" default | "left" | "right") turns two adjacent
// instances into one visually merged segmented control — "left" keeps its
// left corners/right border square, "right" keeps its right corners square
// and drops its own left border so the pair reads as one bordered unit
// instead of two separate boxes with a gap.
// `portalContainer` (optional) — defaults to `document.body` (Radix's own
// default). Pass a ref to an ancestor element when this Select is nested
// inside a Radix Dialog — the Dialog's modal pointer-events lockdown
// otherwise treats the Select's body-level portal as "outside" content and
// disables pointer events on it, silently killing hover highlighting (the
// bug AppsPickerModal.jsx hit: clicking an option still worked, since
// Radix's own click handling doesn't depend on CSS :hover, but the visual
// hover/highlight state never appeared). Keeping the portal inside the
// Dialog's own content subtree avoids that entirely.
// `bgClassName` (optional, default "bg-bg-panel") — trigger background
// override, e.g. "bg-bg-primary" to match a darker surrounding input style
// (used by apps/WeatherSettingsScreen.jsx for its Refresh interval/Font
// family/Background audio fields, to match the Location text input).
// `collapseOnMobile` (optional, default true) — the original icon-only
// 36px-square collapse below `md`, built for the Content page's compact
// filter/sort row. Pass false for a Select that's a full-width labeled
// field in its own right (e.g. a settings form) — it stays full-width with
// its text label visible at every screen size instead of shrinking to a
// bare icon on mobile.
// Used by: components/ContentFilterSortBar.jsx,
// components/DashboardAttentionPanel.jsx, apps/AppsPickerModal.jsx,
// apps/WeatherSettingsScreen.jsx.
