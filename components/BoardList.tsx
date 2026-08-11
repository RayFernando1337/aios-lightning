"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MAX_SELECTED } from "@/convex/lib/limits";
import { card } from "@/lib/styles";

export default function BoardList() {
  const entries = useQuery(api.submissions.board);

  if (entries === undefined) {
    return <p className="text-zinc-400">Loading the lineup...</p>;
  }

  if (entries.length === 0) {
    return (
      <div className={card}>
        <p className="font-semibold">No picks up yet.</p>
        <p className="mt-1 text-sm text-zinc-400">
          This page updates itself the moment a host locks a slot.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-zinc-500">
        {entries.length} of {MAX_SELECTED} slots locked. Top to bottom is the
        running order.
      </p>

      <ol className="mt-4 space-y-3">
        {entries.map((entry, index) => (
          <li key={entry._id} className={`${card} flex items-start gap-4`}>
            <span className="font-mono text-xl font-bold text-amber-300 sm:text-2xl">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight text-zinc-50 sm:text-2xl">
                {entry.demoTitle}
              </p>
              <p className="mt-1 text-zinc-400">{entry.displayName}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
