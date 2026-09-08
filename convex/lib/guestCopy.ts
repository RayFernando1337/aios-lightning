import { Infer, v } from "convex/values";

export const fieldCopyValidator = v.object({
  label: v.string(),
  hint: v.string(),
  placeholder: v.string(),
});

export const guestCopyValidator = v.object({
  brand: v.string(),
  boardHeading: v.string(),
  heroLead: v.string(),
  applyTitle: v.string(),
  applyLead: v.string(),
  applyCta: v.string(),
  applyCtaSignedOut: v.string(),
  showTakeawayOnBoard: v.boolean(),
  liveReviewLabel: v.string(),
  takeawayReviewLabel: v.string(),
  displayName: fieldCopyValidator,
  demoTitle: fieldCopyValidator,
  whatYoullShowLive: fieldCopyValidator,
  takeaway: fieldCopyValidator,
  noSlides: v.string(),
  noPitch: v.string(),
  readyIn60s: v.string(),
});

export type GuestCopy = Infer<typeof guestCopyValidator>;
