export function formatDuration(ms) {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  return `${mins}m`;
}

export function formatClock(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDateLabel(date) {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const weekdayMonthDay = date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (isToday) return `Today · ${weekdayMonthDay}`;
  if (isTomorrow) return `Tomorrow · ${weekdayMonthDay}`;
  return weekdayMonthDay;
}
