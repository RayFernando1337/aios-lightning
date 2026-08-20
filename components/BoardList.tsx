"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { card } from "@/lib/styles";

export default function BoardList({
  slug,
  capacity,
}: {
  slug?: string;
  capacity: number;
}) {
  const entries = useQuery(
    api.submissions.board,
    slug !== undefined ? { slug } : {},
  );

  if (entries === undefined) {
    return <p className="text-muted">Loading the lineup...</p>;
  }

  if (entries.length === 0) {
    return (
      <div className={card}>
        <p className="font-semibold">No picks up yet.</p>
        <p className="mt-1 text-sm text-muted">
          This page updates itself the moment a host locks a slot.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
        {entries.length} of {capacity} slots locked. Top to bottom is the
        running order.
      </p>

      <ol className="mt-6 space-y-4">
        {entries.map((entry, index) => (
          <li key={entry._id} className={`${card} flex items-start gap-4`}>
            <span className="font-display text-4xl tracking-[-0.035em] text-admit sm:text-6xl">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="font-display text-3xl tracking-[-0.035em] text-paper sm:text-5xl">
                {entry.demoTitle}
              </p>
              <p className="mt-2 font-mono text-[11px] tracking-[0.22em] text-cream/80 uppercase">
                {entry.displayName}
              </p>
              {entry.whatYoullShowLive ? (
                <p className="mt-3 whitespace-pre-line text-cream/85 sm:text-lg">
                  {entry.whatYoullShowLive}
                </p>
              ) : null}
              {entry.takeaway ? (
                <p className="mt-3 text-sm text-cream/80 sm:text-base">
                  <span className="font-mono text-[11px] font-bold tracking-[0.22em] text-admit uppercase">
                    Takeaway ·{" "}
                  </span>
                  {entry.takeaway}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
