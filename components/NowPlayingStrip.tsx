"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { MAX_SELECTED } from "@/convex/lib/limits";
import { eyebrow } from "@/lib/styles";

export default function NowPlayingStrip() {
  const entries = useQuery(api.submissions.board);
  const slots =
    entries === undefined
      ? null
      : Array.from(
          { length: MAX_SELECTED },
          (_, index) => entries[index] ?? null,
        );

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="flex items-end justify-between gap-4 px-[var(--pad)]">
        <div>
          <p className={eyebrow}>Now playing</p>
          <h2 className="font-display mt-3 text-4xl tracking-[-0.035em] text-paper sm:text-6xl">
            TONIGHT&apos;S BOARD
          </h2>
        </div>
        <Link
          href="/board"
          className="hidden font-mono text-[11px] font-bold tracking-[0.28em] text-admit uppercase sm:inline"
        >
          Full running order →
        </Link>
      </div>

      {slots === null ? (
        <p className="mt-10 px-[var(--pad)] text-muted">Loading the lineup...</p>
      ) : (
        <div className="mt-10 flex gap-4 overflow-x-auto px-[var(--pad)] pb-4">
          {slots.map((entry, index) => (
            <article
              key={entry?._id ?? `open-${index}`}
              className="poster-card w-[min(42vw,220px)] shrink-0"
            >
              <div
                className={`poster-fill flex h-full flex-col justify-between p-4 ${
                  entry ? "bg-gradient-to-b from-admit/40 to-ink" : "bg-ink"
                }`}
              >
                <p className="font-mono text-[10px] tracking-[0.28em] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div>
                  <p className="font-display text-2xl leading-none tracking-[-0.035em] text-paper">
                    {entry?.demoTitle ?? "UNCLAIMED"}
                  </p>
                  <p className="mt-2 font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
                    {entry?.displayName ?? "Open slot"}
                  </p>
                </div>
              </div>
              <span className="poster-pick">{entry ? "Locked" : "Open"}</span>
            </article>
          ))}
        </div>
      )}

      <p className="mt-6 px-[var(--pad)] sm:hidden">
        <Link
          href="/board"
          className="font-mono text-[11px] font-bold tracking-[0.28em] text-admit uppercase"
        >
          Full running order →
        </Link>
      </p>
    </section>
  );
}
