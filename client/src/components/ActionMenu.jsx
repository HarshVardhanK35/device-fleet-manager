import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const VARIANT_CLASSES = {
  default: "text-text-muted hover:bg-bg-hover hover:text-text-primary",
  warning: "text-accent-amber hover:bg-accent-amber/10",
  danger: "text-accent-red hover:bg-accent-red/10",
};

function ActionMenu({ label = "Actions", items, align = "end", trigger }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger ?? (
          <button
            type="button"
            aria-label={label}
            className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors outline-none focus-visible:outline-2 focus-visible:outline-accent-blue focus-visible:outline-offset-2 data-[state=open]:bg-bg-hover data-[state=open]:text-text-primary"
          >
            <MoreHorizontal size={18} />
          </button>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          className="w-[180px] sm:w-[216px] p-1 bg-bg-panel border border-border-muted rounded-[10px] shadow-[0_8px_24px_rgba(1,4,9,0.55),0_1px_3px_rgba(1,4,9,0.4)] z-50"
        >
          {items.map((item, index) =>
            item.type === "separator" ? (
              <DropdownMenu.Separator
                key={index}
                className="h-px bg-border-muted my-1"
              />
            ) : (
              <DropdownMenu.Item
                key={item.label}
                disabled={item.disabled}
                onSelect={item.onClick}
                className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-[13px] font-medium cursor-pointer outline-none transition-colors ${
                  item.disabled
                    ? "opacity-45 cursor-not-allowed text-text-muted"
                    : (VARIANT_CLASSES[item.variant] || VARIANT_CLASSES.default)
                }`}
              >
                {item.icon && <item.icon size={16} />}
                <span className="flex-1">{item.label}</span>
              </DropdownMenu.Item>
            ),
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default ActionMenu;

// Reusable dropdown menu (wraps Radix UI's DropdownMenu). Takes `items`: an
// array of { label, icon, onClick, variant, disabled } objects, or
// { type: "separator" } to insert a divider. `variant` can be
// "default" | "warning" | "danger" for color-coded actions (e.g. Delete).
// Defaults to a "⋯" icon-button trigger; pass a custom `trigger` element
// (e.g. a user avatar) to use something else — it gets Radix's asChild
// click/keyboard wiring either way.
// Used by: components/AssignmentCard.jsx (default trigger),
// components/Layout.jsx (custom avatar trigger, for the Logout menu).
