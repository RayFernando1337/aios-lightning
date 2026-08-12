"use client";

import { Authenticated, AuthLoading, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import StatusChip from "@/components/StatusChip";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { MAX_SELECTED } from "@/convex/lib/limits";
import { readableError } from "@/lib/errors";
import { STATUS_LABELS, STATUS_ORDER, SubmissionStatus } from "@/lib/status";
import { card } from "@/lib/styles";

const ACTION_ORDER: SubmissionStatus[] = [
  "submitted",
  "shortlisted",
  "selected",
  "rejected",
];

type BriefBlock = {
  key: "live" | "takeaway";
  label: string;
  text: string;
  clampClass: "line-clamp-4" | "line-clamp-2";
};

type TriageCard = {
  id: Id<"submissions">;
  status: SubmissionStatus;
  title: string;
  presenter: string;
  brief: readonly BriefBlock[];
  email: string | null;
};

const BRIEF_SPEC = [
  {
    key: "live",
    label: "Live",
    field: "whatYoullShowLive",
    clampClass: "line-clamp-4",
  },
  {
    key: "takeaway",
    label: "Takeaway",
    field: "takeaway",
    clampClass: "line-clamp-2",
  },
] as const;

/** No pledge fields: `submit` rejects a false one, so all three are always true. */
export function toTriageCard(submission: Doc<"submissions">): TriageCard {
  return {
    id: submission._id,
    status: submission.status,
    title: submission.demoTitle,
    presenter: submission.displayName,
    brief: BRIEF_SPEC.map((spec) => ({
      key: spec.key,
      label: spec.label,
      text: submission[spec.field],
      clampClass: spec.clampClass,
    })),
    email: submission.email || null,
  };
}

type Filter = SubmissionStatus | "all";

export default function HostDashboard() {
  return (
    <>
      <AuthLoading>
        <p className="text-zinc-400">Checking your session...</p>
      </AuthLoading>
      <Authenticated>
        <Triage />
      </Authenticated>
    </>
  );
}

function Triage() {
  const submissions = useQuery(api.submissions.listForHost);
  const setStatus = useMutation(api.submissions.setStatus);

  const [filter, setFilter] = useState<Filter>("all");
  const [pendingId, setPendingId] = useState<Id<"submissions"> | null>(null);
  // Kept per row so a host holding a phone sees the refusal next to the button
  // they just tapped, not at the top of a list they scrolled past.
  const [failure, setFailure] = useState<{
    id: Id<"submissions">;
    message: string;
  } | null>(null);

  if (submissions === undefined) {
    return <p className="text-zinc-400">Loading submissions...</p>;
  }

  const counts = countByStatus(submissions);
  const selectedCount = counts.selected;
  const sorted = [...submissions].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
      a.createdAt - b.createdAt,
  );
  const visible =
    filter === "all"
      ? sorted
      : sorted.filter((submission) => submission.status === filter);
  const cards = visible.map(toTriageCard);

  async function changeStatus(
    submissionId: Id<"submissions">,
    status: SubmissionStatus,
  ) {
    setPendingId(submissionId);
    setFailure(null);
    try {
      await setStatus({ submissionId, status });
    } catch (caught) {
      setFailure({ id: submissionId, message: readableError(caught) });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-10 -mx-5 border-b border-white/10 bg-[#08090c]/95 px-5 py-3 backdrop-blur">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-zinc-400">
            <span
              className={
                selectedCount >= MAX_SELECTED
                  ? "font-bold text-amber-300"
                  : "font-bold text-zinc-100"
              }
            >
              {selectedCount} of {MAX_SELECTED}
            </span>{" "}
            slots picked
          </p>
          <p className="text-sm text-zinc-500">
            {submissions.length} applied
          </p>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <FilterChip
            label={`All ${submissions.length}`}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {STATUS_ORDER.map((status) => (
            <FilterChip
              key={status}
              label={`${STATUS_LABELS[status]} ${counts[status]}`}
              active={filter === status}
              onClick={() => setFilter(status)}
            />
          ))}
        </div>
      </div>

      {cards.length === 0 ? (
        <p className={`${card} text-zinc-400`}>Nothing here yet.</p>
      ) : (
        <ul className="space-y-3">
          {cards.map((triageCard) => (
            <li key={triageCard.id} className={card}>
              <SubmissionRow
                card={triageCard}
                pending={pendingId === triageCard.id}
                failure={
                  failure?.id === triageCard.id ? failure.message : null
                }
                onChange={(status) => changeStatus(triageCard.id, status)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SubmissionRow({
  card,
  pending,
  failure,
  onChange,
}: {
  card: TriageCard;
  pending: boolean;
  failure: string | null;
  onChange: (status: SubmissionStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <h2 className="font-semibold break-words text-zinc-50">{card.title}</h2>

      <div className="mt-1 flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm break-words text-zinc-400">
          {card.presenter}
        </p>
        <StatusChip status={card.status} />
      </div>

      <dl className="mt-3 space-y-2 border-t border-white/10 pt-3">
        {card.brief.map((block) => (
          <div key={block.key}>
            <dt className="sr-only">{block.label}</dt>
            <dd
              // Not pre-line when collapsed: blank lines would spend the clamp.
              className={`${
                expanded
                  ? "whitespace-pre-line"
                  : `${block.clampClass} whitespace-normal`
              } text-sm leading-5 break-words text-zinc-300`}
            >
              <span
                aria-hidden="true"
                className="font-semibold text-amber-300/90 uppercase"
              >
                {block.label} ·{" "}
              </span>
              {block.text}
            </dd>
          </div>
        ))}
      </dl>

      {/* Only the email is truly hidden when collapsed. `line-clamp` clips the
          answers visually but leaves them in the accessibility tree, so this
          controls the email and says so. */}
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={`contact-${card.id}`}
        onClick={() => setExpanded((current) => !current)}
        className="mt-1 min-h-11 py-3 text-sm font-medium text-amber-300/90 hover:text-amber-200"
      >
        {expanded ? "Show less" : "Full answers and email"}
      </button>

      <p
        id={`contact-${card.id}`}
        hidden={!expanded}
        className="font-mono text-xs break-all text-zinc-500"
      >
        {card.email ?? "no email on token"}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ACTION_ORDER.map((status) => {
          const isCurrent = card.status === status;
          return (
            <button
              key={status}
              type="button"
              disabled={pending || isCurrent}
              onClick={() => onChange(status)}
              className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
                isCurrent
                  ? "border-amber-300/50 bg-amber-300/20 text-amber-200"
                  : "border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10 disabled:opacity-40"
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>

      {failure !== null && (
        <p className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {failure}
        </p>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "border-amber-300/50 bg-amber-300/20 text-amber-200"
          : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function countByStatus(
  submissions: Doc<"submissions">[],
): Record<SubmissionStatus, number> {
  const counts: Record<SubmissionStatus, number> = {
    submitted: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0,
  };

  for (const submission of submissions) {
    counts[submission.status] += 1;
  }

  return counts;
}
