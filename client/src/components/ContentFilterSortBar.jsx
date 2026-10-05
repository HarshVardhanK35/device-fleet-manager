import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check, Filter, ArrowUpDown } from "lucide-react";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "app", label: "Apps" },
];

const SORTS = [
  { value: "recent", label: "Recently added" },
  { value: "name", label: "Name A-Z" },
];

function StyledSelect({ value, onChange, options, labelFor, icon: Icon, label }) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        aria-label={label}
        className="group inline-flex items-center justify-center md:justify-between gap-2 bg-bg-panel border border-border-muted hover:bg-bg-hover hover:border-border-hover text-text-primary text-sm rounded-lg w-9 md:w-auto md:min-w-[140px] px-0 md:px-3 h-9 outline-none transition-colors focus-visible:border-accent-blue data-[state=open]:border-accent-blue"
      >
        <Icon
          size={16}
          className="md:hidden text-text-muted group-hover:text-text-primary transition-colors"
        />
        <span className="hidden md:inline">
          <Select.Value />
        </span>
        <Select.Icon className="hidden md:block">
          <ChevronDown
            size={14}
            className="text-text-muted group-hover:text-text-primary transition-colors"
          />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
          className="bg-bg-panel border border-border-muted rounded-[10px] shadow-[0_8px_24px_rgba(1,4,9,0.55),0_1px_3px_rgba(1,4,9,0.4)] p-1 z-50 w-[180px] sm:w-[216px]"
        >
          <Select.Viewport>
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

function ContentFilterSortBar({
  counts,
  filterValue,
  onFilterChange,
  sortValue,
  onSortChange,
}) {
  return (
    <div className="flex items-center gap-2">
      <StyledSelect
        value={filterValue}
        onChange={onFilterChange}
        options={FILTERS}
        labelFor={(f) => `${f.label} (${counts[f.value] ?? 0})`}
        icon={Filter}
        label="Filter content"
      />
      <StyledSelect
        value={sortValue}
        onChange={onSortChange}
        options={SORTS}
        icon={ArrowUpDown}
        label="Sort content"
      />
    </div>
  );
}

export default ContentFilterSortBar;

// Filter-by-type + sort controls for the Content library (Radix Select —
// NOT native <select>, since a native select's expanded option list can't
// be restyled across browsers and looked inconsistent with the rest of the
// dark theme). Replaces the mock's left sidebar filter list, which doesn't
// scale to small screens — see daily discussion 2026-10-05.
// `counts` is { all, image, video, app }. Below `md`, each trigger collapses
// to an icon-only 36px square (Filter / ArrowUpDown) — the dropdown content
// itself is unaffected, still showing full option labels.
// Used by: pages/Content.jsx.
