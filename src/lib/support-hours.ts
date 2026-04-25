const DEFAULT_SUPPORT_TIMEZONE = "Europe/Chisinau";
const DEFAULT_SUPPORT_OPEN_HOUR = 10;
const DEFAULT_SUPPORT_CLOSE_HOUR = 18;
const DEFAULT_SUPPORT_EMAIL = "asistenta@vex.md";
const DEFAULT_SUPPORT_OPEN_DAYS = [1, 2, 3, 4, 5]; // Mon..Fri (JS: 0=Sun, 6=Sat)
const DAY_LABELS_RO = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"] as const;

function toIntInRange(raw: string | undefined, fallback: number, min: number, max: number): number {
  const v = Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(v) || v < min || v > max) {
    return fallback;
  }
  return v;
}

function supportTimezone(): string {
  const tz = process.env.SUPPORT_TIMEZONE?.trim();
  return tz || DEFAULT_SUPPORT_TIMEZONE;
}

function supportOpenHour(): number {
  return toIntInRange(process.env.SUPPORT_OPEN_HOUR, DEFAULT_SUPPORT_OPEN_HOUR, 0, 23);
}

function supportCloseHour(): number {
  return toIntInRange(process.env.SUPPORT_CLOSE_HOUR, DEFAULT_SUPPORT_CLOSE_HOUR, 1, 24);
}

export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;

function supportOpenDays(): number[] {
  const raw = process.env.SUPPORT_OPEN_DAYS?.trim();
  if (!raw) {
    return DEFAULT_SUPPORT_OPEN_DAYS;
  }
  const parsed = raw
    .split(",")
    .map((x) => Number.parseInt(x.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 6);
  return parsed.length > 0 ? Array.from(new Set(parsed)) : DEFAULT_SUPPORT_OPEN_DAYS;
}

function currentHourInSupportTimezone(date: Date): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: supportTimezone(),
    hour: "2-digit",
    hour12: false,
  }).format(date);
  return Number.parseInt(hour, 10);
}

function weekdayInSupportTimezone(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: supportTimezone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = Number.parseInt(parts.find((p) => p.type === "year")?.value ?? "", 10);
  const month = Number.parseInt(parts.find((p) => p.type === "month")?.value ?? "", 10);
  const day = Number.parseInt(parts.find((p) => p.type === "day")?.value ?? "", 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return date.getUTCDay();
  }
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function isLiveSupportOpen(date: Date = new Date()): boolean {
  const hour = currentHourInSupportTimezone(date);
  const weekday = weekdayInSupportTimezone(date);
  const open = supportOpenHour();
  const close = supportCloseHour();
  return supportOpenDays().includes(weekday) && hour >= open && hour < close;
}

export function liveSupportHoursLabel(): string {
  const open = supportOpenHour();
  const close = supportCloseHour();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(open)}:00 - ${pad(close)}:00`;
}

export function liveSupportDaysLabel(): string {
  const days = supportOpenDays().sort((a, b) => a - b);
  if (days.length === 7) {
    return "Luni - Duminică";
  }
  if (days.length === 0) {
    return "Nicio zi";
  }

  const ranges: Array<{ start: number; end: number }> = [];
  for (const day of days) {
    const last = ranges[ranges.length - 1];
    if (!last || day !== last.end + 1) {
      ranges.push({ start: day, end: day });
    } else {
      last.end = day;
    }
  }

  return ranges
    .map((r) => (r.start === r.end ? DAY_LABELS_RO[r.start] : `${DAY_LABELS_RO[r.start]} - ${DAY_LABELS_RO[r.end]}`))
    .join(", ");
}

export function liveSupportScheduleLabel(): string {
  return `${liveSupportDaysLabel()}, ${liveSupportHoursLabel()}`;
}
