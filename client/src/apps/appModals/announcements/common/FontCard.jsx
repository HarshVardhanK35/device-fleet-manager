import { Type } from "lucide-react";

import SettingsCard from "../../../shared/SettingsCard.jsx";
import Field from "../../../shared/Field.jsx";
import StyledSelect from "../../../../components/StyledSelect.jsx";

// The "Font" settings card — one family dropdown over a template's own list.
// `open` / `onOpenChange` coordinate it with the panel's other dropdowns.
function FontCard({ fonts, value, onChange, portalContainer, open, onOpenChange }) {
  return (
    <SettingsCard kicker="Font">
      <Field label="Font family">
        <StyledSelect
          value={value}
          onChange={onChange}
          options={fonts.map((f) => ({ value: f, label: f }))}
          icon={Type}
          label="Font family"
          portalContainer={portalContainer}
          bgClassName="bg-bg-primary"
          collapseOnMobile={false}
          matchTriggerWidth
          open={open}
          onOpenChange={onOpenChange}
        />
      </Field>
    </SettingsCard>
  );
}

export default FontCard;

// Used by: RotatingNoticesSettings.jsx, StatusListSettings.jsx.
