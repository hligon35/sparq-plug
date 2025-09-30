// Shared lightweight time utilities
// Human-readable relative time (seconds/minutes/hours/days)
export function timeAgo(iso: string | Date) {
  const date = iso instanceof Date ? iso : new Date(iso);
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return sec + 's';
  const min = Math.floor(sec / 60); if (min < 60) return min + 'm';
  const hr = Math.floor(min / 60); if (hr < 24) return hr + 'h';
  const d = Math.floor(hr / 24); return d + 'd';
}
