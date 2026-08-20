"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { input } from "@/lib/styles";
import {
  TIME_OPTIONS,
  TimeKey,
  dateFromISO,
  isTimeKey,
  isoFromDate,
  labelForISO,
  todayISO,
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
  const [open, setOpen] = useState(false);
  const selected = dateISO === "" ? undefined : dateFromISO(dateISO);
  const laToday = dateFromISO(todayISO());

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`${input} flex items-center justify-between gap-2 text-left`}
          >
            <span className={dateISO === "" ? "text-muted" : undefined}>
              {dateISO === "" ? "Pick a date" : labelForISO(dateISO)}
            </span>
            <CalendarIcon size={16} className="shrink-0 text-muted" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            today={laToday}
            defaultMonth={selected ?? laToday}
            disabled={{ before: laToday }}
            onSelect={(date) => {
              if (date !== undefined) {
                onChange(isoFromDate(date), timeKey);
                setOpen(false);
              }
            }}
            classNames={{ today: "ring-1 ring-paper/40 ring-inset" }}
          />
        </PopoverContent>
      </Popover>
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
