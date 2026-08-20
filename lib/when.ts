const TIME_ZONE = "America/Los_Angeles";

export const TIME_OPTIONS = [
  "5pm",
  "5:30pm",
  "6pm",
  "6:30pm",
  "7pm",
  "7:30pm",
  "8pm",
  "8:30pm",
  "9pm",
] as const;

export type TimeKey = (typeof TIME_OPTIONS)[number];

export type DateOption = {
  dateISO: string;
  label: string;
};

const UPCOMING_DAYS = 16;

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((entry) => entry.type === type)?.value ?? "";
}

function laParts(ms: number): {
  weekday: string;
  year: number;
  month: number;
  day: number;
  hour: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(ms));

  return {
    weekday: part(parts, "weekday"),
    year: Number(part(parts, "year")),
    month: Number(part(parts, "month")),
    day: Number(part(parts, "day")),
    hour: Number(part(parts, "hour")),
  };
}

function toISO(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Noon-ish in LA, so YYYY-MM-DD never flips weekday via UTC midnight. */
function laCivilNoon(dateISO: string): Date {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 20, 0, 0));
}

function labelForISO(dateISO: string): string {
  const date = laCivilNoon(dateISO);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).formatToParts(date);

  return `${part(parts, "weekday")} ${part(parts, "month")} ${part(parts, "day")}`;
}

function addDaysISO(dateISO: string, days: number): string {
  const [year, month, day] = dateISO.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days, 20, 0, 0));
  const la = laParts(shifted.getTime());
  return toISO(la.year, la.month, la.day);
}

export function isTimeKey(value: string): value is TimeKey {
  return (TIME_OPTIONS as readonly string[]).includes(value);
}

export function formatWhen(dateISO: string, timeKey: string): string {
  return `${labelForISO(dateISO)} · doors ${timeKey}`;
}

export function upcomingDateOptions(nowMs: number = Date.now()): DateOption[] {
  const now = laParts(nowMs);
  let startISO = toISO(now.year, now.month, now.day);
  if (now.hour >= 23) {
    startISO = addDaysISO(startISO, 1);
  }

  const options: DateOption[] = [];
  for (let offset = 0; offset < UPCOMING_DAYS; offset += 1) {
    const dateISO = addDaysISO(startISO, offset);
    options.push({ dateISO, label: labelForISO(dateISO) });
  }
  return options;
}

export function defaultDateISO(nowMs: number = Date.now()): string {
  const options = upcomingDateOptions(nowMs);
  const thursday = options.find((option) => option.label.startsWith("Thu "));
  return thursday?.dateISO ?? options[0]?.dateISO ?? toISO(...civilToday(nowMs));
}

function civilToday(nowMs: number): [number, number, number] {
  const now = laParts(nowMs);
  return [now.year, now.month, now.day];
}

export function defaultWhen(nowMs: number = Date.now()): string {
  return formatWhen(defaultDateISO(nowMs), "6pm");
}
