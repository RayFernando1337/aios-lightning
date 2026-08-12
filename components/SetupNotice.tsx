import { card, eyebrow } from "@/lib/styles";

export default function SetupNotice({ missing }: { missing: string[] }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-6 px-[var(--pad)] py-16">
      <div>
        <p className={eyebrow}>AiOS SF · Lightning</p>
        <h1 className="font-display mt-3 text-5xl tracking-[-0.035em]">
          ALMOST THERE.
        </h1>
        <p className="mt-3 text-muted">
          Set these environment variables, then redeploy. Full steps are in the
          README.
        </p>
      </div>

      <div className={card}>
        <ul className="space-y-2 font-mono text-sm">
          {missing.map((name) => (
            <li key={name} className="flex items-center gap-2 text-admit">
              <span aria-hidden>·</span>
              {name}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-muted">
        These are read at build time, so redeploy after setting them.
      </p>
    </main>
  );
}
