"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import ShareNight from "@/components/ShareNight";
import WhenPicker from "@/components/WhenPicker";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { readableError } from "@/lib/errors";
import { buttonSecondary, card, fieldHint, fieldLabel, input } from "@/lib/styles";
import { DEFAULT_DOORS, formatWhen, parseWhen } from "@/lib/when";

export default function HostEventControls({
  eventId,
  slug,
  phase,
  featured,
  when,
  capacity,
  hostNote,
}: {
  eventId: Id<"events">;
  slug: string;
  phase: "open" | "closed" | "archived";
  featured: boolean;
  when: string;
  capacity: number;
  hostNote?: string;
}) {
  const update = useMutation(api.events.update);
  const setFeatured = useMutation(api.events.setFeatured);
  const parsed = parseWhen(when);
  const [error, setError] = useState<string | null>(null);
  const [dateISO, setDateISO] = useState(() => parsed?.dateISO ?? "");
  const [time, setTime] = useState(() => parsed?.time ?? DEFAULT_DOORS);
  const [touched, setTouched] = useState(false);
  const [dateChosen, setDateChosen] = useState(() => parsed !== null);
  const [savingWhen, setSavingWhen] = useState(false);
  const draftWhen =
    touched && dateChosen ? formatWhen(dateISO, time) : when;
  const [savingSlots, setSavingSlots] = useState(false);
  const [slots, setSlots] = useState(String(capacity));
  const [seenCapacity, setSeenCapacity] = useState(capacity);
  if (capacity !== seenCapacity) {
    setSeenCapacity(capacity);
    setSlots(String(capacity));
  }
  const slotsSavable =
    slots.trim() !== "" &&
    Number.isInteger(Number(slots)) &&
    Number(slots) !== capacity;

  async function setPhase(next: "open" | "closed" | "archived") {
    setError(null);
    try {
      await update({
        eventId,
        phase: next,
      });
    } catch (caught) {
      setError(readableError(caught));
    }
  }

  async function feature() {
    setError(null);
    try {
      await setFeatured({ eventId });
    } catch (caught) {
      setError(readableError(caught));
    }
  }

  async function saveWhen() {
    setError(null);
    setSavingWhen(true);
    try {
      await update({ eventId, when: draftWhen });
    } catch (caught) {
      setError(readableError(caught));
    } finally {
      setSavingWhen(false);
    }
  }

  async function saveSlots() {
    setError(null);
    setSavingSlots(true);
    try {
      await update({ eventId, capacity: Number(slots) });
    } catch (caught) {
      setError(readableError(caught));
    } finally {
      setSavingSlots(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className={fieldLabel}>When</p>
        <p className="font-mono text-[11px] tracking-[0.08em] text-cream/85">
          {when}
        </p>
        <p className={fieldHint}>
          {dateChosen
            ? "Venue date and doors."
            : "This marquee line is free text. Pick a date to replace it."}
        </p>
        <WhenPicker
          dateISO={dateISO}
          time={time}
          onChange={(nextDate, nextTime) => {
            setTouched(true);
            if (nextDate !== dateISO) {
              setDateChosen(true);
            }
            setDateISO(nextDate);
            setTime(nextTime);
          }}
        />
        <button
          type="button"
          onClick={() => void saveWhen()}
          className={buttonSecondary}
          disabled={savingWhen || draftWhen === when}
        >
          {savingWhen ? "Saving..." : "Save when"}
        </button>
      </div>
      <div className="space-y-2">
        <label htmlFor="event-slots" className={fieldLabel}>
          Slots
        </label>
        <p className={fieldHint}>
          Raise any time. Lowering stops at the talks already selected.
        </p>
        <input
          id="event-slots"
          className={input}
          type="number"
          min={1}
          max={30}
          value={slots}
          onChange={(event) => setSlots(event.target.value)}
        />
        <button
          type="button"
          onClick={() => void saveSlots()}
          className={buttonSecondary}
          disabled={savingSlots || !slotsSavable}
        >
          {savingSlots ? "Saving..." : "Save slots"}
        </button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {phase === "open" && (
          <button
            type="button"
            onClick={() => void setPhase("closed")}
            className={buttonSecondary}
          >
            Close applications
          </button>
        )}
        {phase === "closed" && (
          <button
            type="button"
            onClick={() => void setPhase("open")}
            className={buttonSecondary}
          >
            Reopen applications
          </button>
        )}
        {phase !== "archived" && (
          <button
            type="button"
            onClick={() => void setPhase("archived")}
            className={buttonSecondary}
          >
            Archive off home
          </button>
        )}
        {phase === "archived" && (
          <button
            type="button"
            onClick={() => void setPhase("closed")}
            className={buttonSecondary}
          >
            Unarchive
          </button>
        )}
        {!featured && phase !== "archived" && (
          <button type="button" onClick={() => void feature()} className={buttonSecondary}>
            Put on /
          </button>
        )}
      </div>
      {hostNote !== undefined && hostNote.length > 0 && (
        <p className="border border-dashed border-paper/25 px-4 py-3 text-sm text-cream/80">
          {hostNote}
        </p>
      )}
      <div className={card}>
        <ShareNight slug={slug} featured={featured} />
      </div>
      {error !== null && (
        <p className="border border-admit/40 bg-admit/10 px-4 py-3 text-sm text-paper">
          {error}
        </p>
      )}
    </div>
  );
}
