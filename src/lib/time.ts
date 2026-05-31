export const SNAP_MINUTES = 15;
export const DAY_START = 8 * 60; // 8:00
export const DAY_END = 20 * 60; // 20:00
export const PIXELS_PER_MINUTE = 1.15; // 1 hour ≈ 69px — compressed for calmer composition

export const snap = (minutes: number, step = SNAP_MINUTES) =>
  Math.round(minutes / step) * step;

export const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m.toString().padStart(2, "0")} ${period}`;
};

export const formatHourLabel = (h: number) => {
  const period = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh.toString().padStart(2, "0")}:00 ${period}`;
};

export const formatRange = (start: number, end: number) =>
  `${formatTime(start)} — ${formatTime(end)}`;

export const minutesNow = (d = new Date()) => d.getHours() * 60 + d.getMinutes();

export const overlaps = (
  a: { start: number; end: number },
  b: { start: number; end: number },
) => a.start < b.end && b.start < a.end;

export const formatLongDate = (d = new Date()) =>
  d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
