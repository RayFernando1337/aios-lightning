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

      {visible.length === 0 ? (
        <p className={`${card} text-zinc-400`}>Nothing here yet.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((submission) => (
            <li key={submission._id} className={card}>
              <SubmissionRow
                submission={submission}
                pending={pendingId === submission._id}
                failure={
                  failure?.id === submission._id ? failure.message : null
                }
                onChange={(status) => changeStatus(submission._id, status)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SubmissionRow({
  submission,
  pending,
  failure,
  onChange,
}: {
  submission: Doc<"submissions">;
  pending: boolean;
  failure: string | null;
  onChange: (status: SubmissionStatus) => void;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-zinc-50">
            {submission.demoTitle}
          </p>
          <p className="mt-0.5 truncate text-sm text-zinc-400">
            {submission.displayName}
          </p>
        </div>
        <StatusChip status={submission.status} />
      </div>

      <details className="group mt-3">
        <summary className="cursor-pointer list-none text-sm font-medium text-amber-300/90 hover:text-amber-200">
          <span className="group-open:hidden">Show details</span>
          <span className="hidden group-open:inline">Hide details</span>
        </summary>

        <div className="mt-3 space-y-3 border-t border-white/10 pt-3 text-sm">
          <div>
            <p className="font-semibold text-zinc-300">Showing live</p>
            <p className="mt-1 whitespace-pre-line text-zinc-400">
              {submission.whatYoullShowLive}
            </p>
          </div>
          <div>
            <p className="font-semibold text-zinc-300">Takeaway</p>
            <p className="mt-1 whitespace-pre-line text-zinc-400">
              {submission.takeaway}
            </p>
          </div>
          <p className="font-mono text-xs break-all text-zinc-500">
            {submission.email || "no email on token"}
          </p>
        </div>
      </details>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ACTION_ORDER.map((status) => {
          const isCurrent = submission.status === status;
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
