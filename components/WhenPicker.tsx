"use client";

import { useMemo } from "react";
import { input } from "@/lib/styles";
import {
  TIME_OPTIONS,
  TimeKey,
  formatWhen,
  isTimeKey,
  upcomingDateOptions,
} from "@/lib/when";

export default function WhenPicker({
  dateISO,
  timeKey,
  onChange,
}: {
  dateISO: string;
  timeKey: TimeKey;
  onChange: (dateISO: string, timeKey: TimeKey) => void;
}) {
  const options = useMemo(() => {
    const upcoming = upcomingDateOptions();
    if (upcoming.some((option) => option.dateISO === dateISO)) {
      return upcoming;
    }
    return [
      {
        dateISO,
        label: formatWhen(dateISO, timeKey).split(" · ")[0] ?? dateISO,
      },
      ...upcoming,
    ];
  }, [dateISO, timeKey]);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="min-w-0">
        <span className="sr-only">Date</span>
        <select
          className={input}
          value={dateISO}
          onChange={(event) => onChange(event.target.value, timeKey)}
        >
          {options.map((option) => (
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
          value={timeKey}
          onChange={(event) => {
            const next = event.target.value;
            if (isTimeKey(next)) {
              onChange(dateISO, next);
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
