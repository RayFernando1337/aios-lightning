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
  "9:30pm",
] as const;

export type TimeKey = (typeof TIME_OPTIONS)[number];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const WHEN_RE =
  /(?:^|,\s+)([A-Za-z]{3}) ([A-Za-z]{3}) (\d{1,2})(?: · doors (.+))?$/;

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
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(ms));

  return {
    weekday: part(parts, "weekday"),
    year: Number(part(parts, "year")),
    month: Number(part(parts, "month")),
    day: Number(part(parts, "day")),
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

export function labelForISO(dateISO: string): string {
  const date = laCivilNoon(dateISO);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).formatToParts(date);

  return `${part(parts, "weekday")} ${part(parts, "month")} ${part(parts, "day")}`;
}

/** Local civil components: the host picks the calendar day they mean in SF. */
export function dateFromISO(dateISO: string): Date {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isoFromDate(date: Date): string {
  return toISO(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function todayISO(nowMs: number = Date.now()): string {
  const now = laParts(nowMs);
  return toISO(now.year, now.month, now.day);
}

export function isTimeKey(value: string): value is TimeKey {
  return (TIME_OPTIONS as readonly string[]).includes(value);
}

export function formatWhen(dateISO: string, timeKey: string): string {
  return `${labelForISO(dateISO)} · doors ${timeKey}`;
}

function monthNumber(month: string): number | null {
  const index = MONTHS.findIndex((name) => name === month);
  return index === -1 ? null : index + 1;
}

function dateISOForLabel(label: string, nowMs: number): string | null {
  const match = label.match(/^([A-Za-z]{3}) ([A-Za-z]{3}) (\d{1,2})$/);
  if (match === null) {
    return null;
  }

  const weekday = match[1];
  const monthName = match[2];
  const day = Number(match[3]);
  const month = monthNumber(monthName);
  if (month === null || !Number.isInteger(day) || day < 1 || day > 31) {
    return null;
  }

  const year = laParts(nowMs).year;
  for (const candidateYear of [year, year + 1, year - 1]) {
    const dateISO = toISO(candidateYear, month, day);
    if (labelForISO(dateISO) === `${weekday} ${monthName} ${day}`) {
      return dateISO;
    }
  }

  return null;
}

export function parseWhen(
  when: string,
  nowMs: number = Date.now(),
): { dateISO: string; timeKey: TimeKey } | null {
  const match = when.match(WHEN_RE);
  if (match === null) {
    return null;
  }

  const timeKey = match[4] ?? "6pm";
  if (!isTimeKey(timeKey)) {
    return null;
  }

  const dateISO = dateISOForLabel(
    `${match[1]} ${match[2]} ${match[3]}`,
    nowMs,
  );
  if (dateISO === null) {
    return null;
  }

  return { dateISO, timeKey };
}
