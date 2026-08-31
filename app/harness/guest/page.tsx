"use client";

import { useQuery } from "convex/react";
import { notFound } from "next/navigation";
import BoardList from "@/components/BoardList";
import { api } from "@/convex/_generated/api";
import { card, eyebrow, fieldHint, fieldLabel, input, pageMain } from "@/lib/styles";

export default function GuestHarness() {
  const event = useQuery(api.events.featured);

  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  if (event === undefined) {
    return (
      <main className={pageMain}>
        <p className="text-muted">Loading the night...</p>
      </main>
    );
  }

  if (event === null) {
    return (
      <main className={pageMain}>
        <p className="text-muted">No featured night.</p>
      </main>
    );
  }

  const copy = event.guestCopy;

  return (
    <main className={`${pageMain} max-w-4xl`} data-harness-guest="true">
      <p className={eyebrow} data-brand>
        {copy.brand}
      </p>
      <h1 className="font-display mt-3 text-5xl tracking-[-0.035em]">
        {copy.applyTitle}
      </h1>
      <p className="mt-4 max-w-xl text-cream/85" data-apply-lead>
        {event.when}. {event.capacity} slots. {copy.applyLead}
      </p>

      <form className="mt-10 space-y-5" data-apply-fields>
        <div>
          <label className={fieldLabel}>{copy.displayName.label}</label>
          <p className={fieldHint}>{copy.displayName.hint}</p>
          <input
            className={`${input} mt-2`}
            placeholder={copy.displayName.placeholder}
            readOnly
          />
        </div>
        <div>
          <label className={fieldLabel}>{copy.demoTitle.label}</label>
          <p className={fieldHint}>{copy.demoTitle.hint}</p>
          <input
            className={`${input} mt-2`}
            placeholder={copy.demoTitle.placeholder}
            readOnly
          />
        </div>
        <div>
          <label className={fieldLabel}>{copy.whatYoullShowLive.label}</label>
          <p className={fieldHint}>{copy.whatYoullShowLive.hint}</p>
          <textarea
            className={`${input} mt-2 min-h-28`}
            placeholder={copy.whatYoullShowLive.placeholder}
            readOnly
          />
        </div>
        <div>
          <label className={fieldLabel}>{copy.takeaway.label}</label>
          <p className={fieldHint}>{copy.takeaway.hint}</p>
          <textarea
            className={`${input} mt-2 min-h-24`}
            placeholder={copy.takeaway.placeholder}
            readOnly
          />
        </div>
        <p className={`${card} text-sm text-cream/90`}>{copy.noSlides}</p>
        <p className={`${card} text-sm text-cream/90`}>{copy.noPitch}</p>
        <p className={`${card} text-sm text-cream/90`}>{copy.readyIn60s}</p>
      </form>

      <h2 className="font-display mt-16 text-5xl tracking-[-0.035em]">
        {copy.boardHeading}
      </h2>
      <div className="mt-8">
        <BoardList
          slug={event.slug}
          capacity={event.capacity}
          showTakeaway={copy.showTakeawayOnBoard}
          liveLabel={copy.liveReviewLabel}
          takeawayLabel={copy.takeawayReviewLabel}
        />
      </div>
    </main>
  );
}
