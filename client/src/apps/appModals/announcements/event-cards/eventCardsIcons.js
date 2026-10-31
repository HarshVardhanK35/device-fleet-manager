import { Cake, Flag, Hand, Trophy, CalendarHeart } from "lucide-react";

// One icon per card type (spec §6: cake, flag-pennant, hand-waving, trophy,
// calendar-star — nearest lucide equivalents). Separate from the config so
// that file stays free of components.
export const TYPE_ICON = {
  birthday: Cake,
  milestone: Flag,
  welcome: Hand,
  congrats: Trophy,
  holiday: CalendarHeart,
};
