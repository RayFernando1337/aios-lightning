"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import RouteCodes from "@/components/RouteCodes";
import WhenPicker from "@/components/WhenPicker";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { readableError } from "@/lib/errors";
import { buttonSecondary, fieldHint, fieldLabel } from "@/lib/styles";
import { parseWhen } from "@/lib/when";

export default function HostEventControls({
  eventId,
  slug,
  phase,
  featured,
  when,
}: {
  eventId: Id<"events">;
  slug: string;
  phase: "open" | "closed";
  featured: boolean;
  when: string;
}) {
  const update = useMutation(api.events.update);
  const setFeatured = useMutation(api.events.setFeatured);
  const [error, setError] = useState<string | null>(null);
  const [editedWhen, setEditedWhen] = useState<string | null>(null);
  const [savingWhen, setSavingWhen] = useState(false);
  const draftWhen = editedWhen ?? when;
  const knownWhen = parseWhen(when) !== null;

  async function togglePhase() {
    setError(null);
    try {
      await update({
        eventId,
        phase: phase === "open" ? "closed" : "open",
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
      setEditedWhen(null);
    } catch (caught) {
      setError(readableError(caught));
    } finally {
      setSavingWhen(false);
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
          {knownWhen
            ? "San Francisco date and doors."
            : "This marquee line is free text. Pick a date to replace it."}
        </p>
        <WhenPicker value={draftWhen} onChange={setEditedWhen} />
        <button
          type="button"
          onClick={() => void saveWhen()}
          className={buttonSecondary}
          disabled={savingWhen || draftWhen === when}
        >
          {savingWhen ? "Saving..." : "Save when"}
        </button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={() => void togglePhase()} className={buttonSecondary}>
          {phase === "open" ? "Close applications" : "Reopen applications"}
        </button>
        {!featured && (
          <button type="button" onClick={() => void feature()} className={buttonSecondary}>
            Put on /
          </button>
        )}
      </div>
      <RouteCodes slug={slug} featured={featured} />
      {error !== null && (
        <p className="border border-admit/40 bg-admit/10 px-4 py-3 text-sm text-paper">
          {error}
        </p>
      )}
    </div>
  );
}
