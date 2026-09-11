export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Compact label for the date-carousel pill itself (day name + day number)
export function formatDatePillParts(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-IN", { weekday: "short" }),
    date: d.getDate(),
    month: d.toLocaleDateString("en-IN", { month: "short" }),
  };
}

export function formatDateHeading(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatShowDuration(startIso: string, endIso: string) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  const mins = Math.round((end - start) / 60_000);
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  if (hours && remainder) return `${hours}h ${remainder}m`;
  if (hours) return `${hours}h`;
  return `${remainder}m`;
}

export function isValidDate(date: Date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}
