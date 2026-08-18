"use client";

import { useMemo } from "react";
import { input } from "@/lib/styles";
import {
  TIME_OPTIONS,
  TimeKey,
  defaultDateISO,
  formatWhen,
  isTimeKey,
  parseWhen,
  upcomingDateOptions,
} from "@/lib/when";

export default function WhenPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (when: string) => void;
}) {
  const options = useMemo(() => upcomingDateOptions(), []);
  const parsed = value !== undefined && value.length > 0 ? parseWhen(value) : null;
  const resolvedDate = parsed?.dateISO ?? defaultDateISO();
  const resolvedTime = parsed?.timeKey ?? "6pm";

  const dates = useMemo(() => {
    if (options.some((option) => option.dateISO === resolvedDate)) {
      return options;
    }
    return [
      {
        dateISO: resolvedDate,
        label:
          formatWhen(resolvedDate, resolvedTime).split(" · ")[0] ??
          resolvedDate,
      },
      ...options,
    ];
  }, [options, resolvedDate, resolvedTime]);

  function emit(nextDate: string, nextTime: TimeKey) {
    onChange?.(formatWhen(nextDate, nextTime));
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="min-w-0">
        <span className="sr-only">Date</span>
        <select
          className={input}
          value={resolvedDate}
          onChange={(event) => emit(event.target.value, resolvedTime)}
        >
          {dates.map((option) => (
            <option key={option.dateISO} value={option.dateISO}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-0">
        <span className="sr-only">Doors</span>
        <select
          className={input}
          value={resolvedTime}
          onChange={(event) => {
            const next = event.target.value;
            if (isTimeKey(next)) {
              emit(resolvedDate, next);
            }
          }}
        >
          {TIME_OPTIONS.map((option) => (
            <option key={option} value={option}>
              doors {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
