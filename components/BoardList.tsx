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

      <ol className="mt-4 space-y-4">
        {entries.map((entry, index) => (
          <li key={entry._id} className={`${card} flex items-start gap-4`}>
            <span className="font-mono text-xl font-bold text-amber-300 sm:text-3xl">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight text-zinc-50 sm:text-3xl">
                {entry.demoTitle}
              </p>
              <p className="mt-1 text-zinc-300 sm:text-lg">
                {entry.displayName}
              </p>
              {/* The deployed Convex functions can lag this frontend (deploy
                  window, frontend-only previews), leaving these fields
                  undefined at runtime despite the validator type. Degrade to
                  the title-and-name card instead of dangling labels. */}
              {entry.whatYoullShowLive ? (
                <p className="mt-3 whitespace-pre-line text-zinc-200 sm:text-lg">
                  {entry.whatYoullShowLive}
                </p>
              ) : null}
              {entry.takeaway ? (
                <p className="mt-3 text-sm text-zinc-300 sm:text-base">
                  <span className="font-semibold text-amber-300">
                    Takeaway:{" "}
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
