import { Infer } from "convex/values";
import { statusValidator } from "../schema";

export type SubmissionStatus = Infer<typeof statusValidator>;

export type OrphanMergeFields = {
  displayName: string;
  demoTitle: string;
  whatYoullShowLive: string;
  takeaway: string;
  noSlides: boolean;
  noPitch: boolean;
  readyIn60s: boolean;
  email: string;
  status: SubmissionStatus;
  selectedAt?: number;
  updatedAt: number;
};

const STATUS_RANK: Record<SubmissionStatus, number> = {
  rejected: 0,
  submitted: 1,
  shortlisted: 2,
  selected: 3,
};

function preferStatus(
  orphan: OrphanMergeFields,
  existing: OrphanMergeFields,
): boolean {
  const orphanRank = STATUS_RANK[orphan.status];
  const existingRank = STATUS_RANK[existing.status];
  if (orphanRank !== existingRank) {
    return orphanRank > existingRank;
  }
  return orphan.updatedAt > existing.updatedAt;
}

export function mergeOrphanFields(
  orphan: OrphanMergeFields,
  existing: OrphanMergeFields,
  hasOpenSelectedSlot: boolean,
): Omit<OrphanMergeFields, "updatedAt"> & { updatedAt: number } {
  const statusSource = preferStatus(orphan, existing) ? orphan : existing;
  const contentSource =
    orphan.updatedAt >= existing.updatedAt ? orphan : existing;

  let status = statusSource.status;
  let selectedAt = statusSource.selectedAt;
  const addingSelected =
    status === "selected" && existing.status !== "selected";
  if (addingSelected && !hasOpenSelectedSlot) {
    status = "shortlisted";
    selectedAt = undefined;
  }

  return {
    displayName: contentSource.displayName,
    demoTitle: contentSource.demoTitle,
    whatYoullShowLive: contentSource.whatYoullShowLive,
    takeaway: contentSource.takeaway,
    noSlides: contentSource.noSlides,
    noPitch: contentSource.noPitch,
    readyIn60s: contentSource.readyIn60s,
    email: contentSource.email,
    status,
    selectedAt,
    updatedAt: contentSource.updatedAt,
  };
}
