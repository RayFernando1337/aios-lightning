import {
  STATUS_CHIP_STYLES,
  STATUS_LABELS,
  SubmissionStatus,
} from "@/lib/status";

export default function StatusChip({ status }: { status: SubmissionStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CHIP_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
