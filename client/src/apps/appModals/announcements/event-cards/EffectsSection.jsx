import SettingsCard from "../../../shared/SettingsCard.jsx";
import ToggleSwitch from "../../../shared/ToggleSwitch.jsx";
import Hint from "../common/Hint.jsx";
import {
  CARD_TYPES,
  EFFECT_GROUPS,
  ICON_MOTION_EFFECT,
  TYPE_EFFECT,
} from "./eventCardsConfig.js";

// A label + switch + one-line hint — the same row used for every effect.
function EffectRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-text-primary text-sm font-medium">{label}</span>
        <ToggleSwitch checked={checked} onChange={onChange} />
      </div>
      <Hint text={hint} />
    </div>
  );
}

// Group title (Entrance, Ambient…) — each effect below has its own switch.
function GroupHeader({ label }) {
  return (
    <span className="text-[11px] font-semibold tracking-[.08em] uppercase text-text-muted">
      {label}
    </span>
  );
}

// The "Attention" settings card — the effect switches (spec §8), shown in
// groups, plus Reduce motion. Effects apply to the whole widget. The "Per
// card type" group shows Icon motion plus one effect for each card type that
// is actually in the rotation.
function EffectsSection({ form, set }) {
  const effects = form.effects;
  const typesInUse = CARD_TYPES.filter((t) => form.cards.some((c) => c.type === t));

  const groups = [
    EFFECT_GROUPS[0],
    {
      id: "per-type",
      label: "Per card type",
      effects: [
        ICON_MOTION_EFFECT,
        ...typesInUse.filter((t) => TYPE_EFFECT[t]).map((t) => TYPE_EFFECT[t]),
      ],
    },
    EFFECT_GROUPS[1],
  ];

  const visible = groups.flatMap((g) => g.effects);
  const onCount = visible.filter((e) => effects[e.key]).length;

  function setEffect(key, value) {
    set("effects", { ...effects, [key]: value });
  }

  return (
    <SettingsCard kicker={`Attention (${onCount} of ${visible.length} on)`}>
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-3.5 bg-bg-primary border border-border-muted rounded-lg p-3">
          <GroupHeader label={group.label} />
          {group.effects.map((e) => (
            <EffectRow
              key={e.key}
              label={e.label}
              hint={e.hint}
              checked={Boolean(effects[e.key])}
              onChange={(v) => setEffect(e.key, v)}
            />
          ))}
        </div>
      ))}

      <div className="flex flex-col gap-3.5 bg-bg-primary border border-border-muted rounded-lg p-3">
        <EffectRow
          label="Reduce motion"
          hint="Turns every entrance into a plain fade and stops confetti, fireworks and the glow."
          checked={form.reduceMotion}
          onChange={(v) => set("reduceMotion", v)}
        />
      </div>
    </SettingsCard>
  );
}

export default EffectsSection;

// Used by: EventCardsSettings.jsx.
