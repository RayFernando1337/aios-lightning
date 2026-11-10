import ApplyCta from "@/components/ApplyCta";
import type { PublicEvent } from "@/convex/events";
import { card, eyebrow } from "@/lib/styles";
import { venueLine } from "@/lib/venue";
import { formatClock, formatTimeRange, labelForISO, parseWhen } from "@/lib/when";

const detailLabel =
  "font-mono text-[11px] font-bold tracking-[0.28em] text-muted uppercase";

export default function NightProgram({
  event,
  applyHref,
}: {
  event: PublicEvent;
  applyHref: string;
}) {
  const parsed = parseWhen(event.when);
  const hasDoors = parsed !== null && event.when.includes("· doors ");
  const details = [
    parsed === null
      ? { label: "When", value: event.when }
      : { label: "Date", value: labelForISO(parsed.dateISO) },
    ...(hasDoors
      ? [{ label: "Time", value: formatTimeRange(parsed.time, event.endTime) }]
      : event.endTime === undefined
        ? []
        : [{ label: "Ends", value: formatClock(event.endTime) }]),
    { label: "Venue", value: venueLine(event.where, event.room) },
    ...(event.hostNames === undefined
      ? []
      : [{ label: "Hosts", value: event.hostNames.join(", ") }]),
  ];
  const talks = event.talks ?? [];

  return (
    <section className="border-t border-line bg-ink px-[var(--pad)] py-16 sm:py-20">
      <dl className="grid max-w-5xl gap-x-8 gap-y-5 border-y border-dashed border-paper/20 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {details.map((detail) => (
          <div key={detail.label}>
            <dt className={detailLabel}>{detail.label}</dt>
            <dd className="mt-1 text-base text-paper">{detail.value}</dd>
          </div>
        ))}
      </dl>

      {talks.length > 0 && (
        <div className="mt-14">
          <p className={eyebrow}>Featured talks</p>
          <ol className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {talks.map((talk, index) => (
              <li key={`${index}-${talk.title}`} className={`${card} flex flex-col`}>
                <p className="font-mono text-[11px] font-bold tracking-[0.28em] text-admit">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="font-display mt-3 text-2xl leading-tight tracking-[-0.02em] text-paper sm:text-3xl">
                  {talk.title}
                </p>
                <p className="mt-4 font-semibold text-cream">{talk.speakerName}</p>
                {talk.affiliation !== undefined && (
                  <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                    {talk.affiliation}
                  </p>
                )}
                {talk.blurb !== undefined && (
                  <p className="mt-3 text-sm leading-relaxed text-cream/80">{talk.blurb}</p>
                )}
                {talk.url !== undefined && (
                  <a
                    href={talk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 font-mono text-[11px] font-bold tracking-[0.22em] text-admit uppercase transition hover:text-paper"
                  >
                    Talk link ↗
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-10 flex max-w-3xl flex-col gap-4 border border-dashed border-paper/25 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-cream/90">
          {talks.length > 0 ? "After the featured talks, " : ""}
          {event.capacity} open lightning slots go to live demos.{" "}
          {event.phase === "open"
            ? "Apply to take one."
            : "Applications are closed."}
        </p>
        {event.phase === "open" && (
          <div className="shrink-0">
            <ApplyCta
              href={applyHref}
              label={event.guestCopy.applyCta}
              signedOutLabel={event.guestCopy.applyCtaSignedOut}
            />
          </div>
        )}
      </div>
    </section>
  );
}
