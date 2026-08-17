"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { CopyLink } from "@/components/HostDesk";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { readableError } from "@/lib/errors";
import { eventPath } from "@/lib/paths";
import { buttonSecondary } from "@/lib/styles";

export default function HostEventControls({
  eventId,
  slug,
  phase,
  featured,
}: {
  eventId: Id<"events">;
  slug: string;
  phase: "open" | "closed";
  featured: boolean;
}) {
  const update = useMutation(api.events.update);
  const setFeatured = useMutation(api.events.setFeatured);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <CopyLink path={eventPath(slug)} />
        <button type="button" onClick={() => void togglePhase()} className={buttonSecondary}>
          {phase === "open" ? "Close applications" : "Reopen applications"}
        </button>
        {!featured && (
          <button type="button" onClick={() => void feature()} className={buttonSecondary}>
            Put on /
          </button>
        )}
      </div>
      {error !== null && (
        <p className="border border-admit/40 bg-admit/10 px-4 py-3 text-sm text-paper">
          {error}
        </p>
      )}
    </div>
  );
}
