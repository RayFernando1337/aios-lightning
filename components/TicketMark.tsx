export default function TicketMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`ticket-icon size-5 shrink-0 ${className ?? ""}`}
    >
      <path
        fill="currentColor"
        d="M3.5 8.2c0-.9.7-1.6 1.6-1.6h14c.9 0 1.6.7 1.6 1.6v2.05a1.55 1.55 0 0 0 0 3.1V15.8c0 .9-.7 1.6-1.6 1.6h-14c-.9 0-1.6-.7-1.6-1.6v-2.05a1.55 1.55 0 0 0 0-3.1V8.2Zm10.2-.4v8.4h1.3V7.8h-1.3Z"
      />
    </svg>
  );
}
