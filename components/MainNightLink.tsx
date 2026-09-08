import Link from "next/link";

export default function MainNightLink() {
  return (
    <Link
      href="/"
      className="font-mono text-[11px] font-bold tracking-[0.22em] text-admit uppercase transition hover:text-paper"
    >
      ← Main night
    </Link>
  );
}
