"use client";

import { Authenticated, AuthLoading, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import ShareNight from "@/components/ShareNight";
import WhenPicker from "@/components/WhenPicker";
import { api } from "@/convex/_generated/api";
import { DEFAULT_CAPACITY, EVENT_FIELD_LIMITS } from "@/convex/lib/limits";
import { readableError } from "@/lib/errors";
import { hostEventPath } from "@/lib/paths";
import {
  buttonPrimary,
  card,
  fieldHint,
  fieldLabel,
  input,
} from "@/lib/styles";
import { DEFAULT_DOORS, formatWhen } from "@/lib/when";

export default function HostDesk() {
  return (
    <>
      <AuthLoading>
        <p className="text-muted">Checking your session...</p>
      </AuthLoading>
      <Authenticated>
        <Desk />
      </Authenticated>
    </>
  );
}

function Desk() {
  const ensureSeed = useMutation(api.events.ensureSeed);
  const events = useQuery(api.events.listForHost);

  useEffect(() => {
    void ensureSeed({});
  }, [ensureSeed]);

  if (events === undefined) {
    return <p className="text-muted">Loading events...</p>;
  }

  return (
    <div className="space-y-8">
      {events.length === 0 ? (
        <p className={`${card} text-muted`}>
          No nights yet. Post one below. The first one becomes the house QR at
          /.
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((row) => (
            <li key={row.event._id} className={card}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl tracking-[-0.035em] text-paper">
                    {row.event.name}
                  </p>
                  <p className="mt-1 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                    {row.event.when}
                    {row.event.room.length > 0 ? ` · ${row.event.room}` : ""}
                  </p>
                </div>
                <p className="font-mono text-[11px] tracking-[0.18em] text-admit uppercase">
                  {row.featured ? "On /" : row.event.phase}
                </p>
              </div>
              <p className="mt-3 text-sm text-cream/80">
                {row.counts.selected} of {row.event.capacity} selected ·{" "}
                {row.counts.submitted +
                  row.counts.shortlisted +
                  row.counts.selected +
                  row.counts.rejected}{" "}
                applied
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={hostEventPath(row.event.slug)}
                  className={buttonPrimary}
                >
                  Triage
                </Link>
              </div>
              <div className="mt-4">
                <ShareNight slug={row.event.slug} featured={row.featured} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <CreateEventForm />
    </div>
  );
}

function CreateEventForm() {
  const create = useMutation(api.events.create);
  const [name, setName] = useState("");
  const [dateISO, setDateISO] = useState("");
  const [time, setTime] = useState(DEFAULT_DOORS);
  const [where, setWhere] = useState("");
  const [room, setRoom] = useState("");
  const [capacity, setCapacity] = useState(String(DEFAULT_CAPACITY));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (dateISO === "") {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await create({
        name,
        when: formatWhen(dateISO, time),
        where,
        room,
        capacity: Number(capacity),
      });
      setName("");
      setDateISO("");
      setTime(DEFAULT_DOORS);
      setWhere("");
      setRoom("");
      setCapacity(String(DEFAULT_CAPACITY));
    } catch (caught) {
      setError(readableError(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${card} space-y-4`}>
      <p className="font-display text-2xl tracking-[-0.035em] text-paper">
        Post a night
      </p>
      <div>
        <label htmlFor="event-name" className={fieldLabel}>
          Name
        </label>
        <p className={fieldHint}>Becomes the QR link, like /e/workshop-b.</p>
        <input
          id="event-name"
          className={`${input} mt-2`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={EVENT_FIELD_LIMITS.name}
          placeholder="AiOS SF · Workshop B"
          required
        />
      </div>
      <div>
        <p className={fieldLabel}>When</p>
        <p className={fieldHint}>San Francisco date and doors. No typing.</p>
        <div className="mt-2">
          <WhenPicker
            dateISO={dateISO}
            time={time}
            onChange={(nextDate, nextTime) => {
              setDateISO(nextDate);
              setTime(nextTime);
            }}
          />
        </div>
      </div>
      <div>
        <label htmlFor="event-where" className={fieldLabel}>
          Where
        </label>
        <input
          id="event-where"
          className={`${input} mt-2`}
          value={where}
          onChange={(event) => setWhere(event.target.value)}
          maxLength={EVENT_FIELD_LIMITS.where}
          placeholder="Convex HQ, San Francisco"
          required
        />
      </div>
      <div>
        <label htmlFor="event-room" className={fieldLabel}>
          Room
        </label>
        <p className={fieldHint}>Optional. Use this when two rooms run at once.</p>
        <input
          id="event-room"
          className={`${input} mt-2`}
          value={room}
          onChange={(event) => setRoom(event.target.value)}
          maxLength={EVENT_FIELD_LIMITS.room}
          placeholder="Workshop A"
        />
      </div>
      <div>
        <label htmlFor="event-capacity" className={fieldLabel}>
          Slots
        </label>
        <input
          id="event-capacity"
          className={`${input} mt-2`}
          type="number"
          min={1}
          max={30}
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
          required
        />
      </div>
      {error !== null && (
        <p className="border border-admit/40 bg-admit/10 px-4 py-3 text-sm text-paper">
          {error}
        </p>
      )}
      <button
        type="submit"
        className={buttonPrimary}
        disabled={saving || dateISO === ""}
      >
        {saving ? "Posting..." : "Post night"}
      </button>
    </form>
  );
}
