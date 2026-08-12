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
  submitted: "border-line bg-paper/10 text-cream",
  shortlisted: "border-cream/40 bg-cream/15 text-cream",
  selected: "border-admit/60 bg-admit/20 text-paper",
  rejected: "border-line bg-paper/5 text-muted",
};

/** What the applicant should do next, by status. */
export const APPLICANT_NEXT_STEP: Record<SubmissionStatus, string> = {
  submitted: "You are in the pool. Hosts are picking tonight.",
  shortlisted: "Shortlisted. Stay close to the front and keep it warm.",
  selected: "You are on the list. Find the host for the dry run.",
  rejected: "Not this time. Bring it back next month.",
};
