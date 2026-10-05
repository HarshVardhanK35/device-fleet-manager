// Formats a duration in milliseconds as MM:SS, or HH:MM:SS once it reaches
// an hour — e.g. 60000 -> "01:00", 5420000 -> "01:30:20".
export function formatDuration(durationInMillis) {
  const totalSeconds = Math.round(durationInMillis / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}
