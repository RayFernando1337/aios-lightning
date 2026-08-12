import {
  STATUS_CHIP_STYLES,
  STATUS_LABELS,
  SubmissionStatus,
} from "@/lib/status";

export default function StatusChip({ status }: { status: SubmissionStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.18em] uppercase ${STATUS_CHIP_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
