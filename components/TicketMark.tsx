export default function TicketMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`ticket-icon size-4 shrink-0 ${className ?? ""}`}
    >
      <path
        fill="currentColor"
        d="M4.5 8.25A1.75 1.75 0 0 1 6.25 6.5h11.5A1.75 1.75 0 0 1 19.5 8.25v2.1a1.6 1.6 0 1 0 0 3.3v2.1A1.75 1.75 0 0 1 17.75 17.5H6.25A1.75 1.75 0 0 1 4.5 15.75v-2.1a1.6 1.6 0 1 0 0-3.3v-2.1Zm2.2 1.1v5.3h10.6v-5.3H6.7Z"
      />
    </svg>
  );
}
