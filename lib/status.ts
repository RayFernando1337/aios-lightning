import { Doc } from "@/convex/_generated/dataModel";

export type SubmissionStatus = Doc<"submissions">["status"];

/** Host view ordering: what needs attention first. */
export const STATUS_ORDER: SubmissionStatus[] = [
  "selected",
  "shortlisted",
  "submitted",
  "rejected",
];

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  submitted: "Submitted",
  shortlisted: "Shortlisted",
  selected: "Selected",
  rejected: "Not this time",
};

export const STATUS_CHIP_STYLES: Record<SubmissionStatus, string> = {
  submitted: "border-white/15 bg-white/10 text-zinc-200",
  shortlisted: "border-sky-300/30 bg-sky-400/15 text-sky-200",
  selected: "border-amber-300/40 bg-amber-300/20 text-amber-200",
  rejected: "border-rose-400/25 bg-rose-500/10 text-rose-200",
};

/** What the applicant should do next, by status. */
export const APPLICANT_NEXT_STEP: Record<SubmissionStatus, string> = {
  submitted: "You are in the pool. Hosts are picking tonight.",
  shortlisted: "Shortlisted. Stay close to the front and keep it warm.",
  selected: "You are on the list. Find Ray for the dry run.",
  rejected: "Not this time. Bring it back next month.",
};
