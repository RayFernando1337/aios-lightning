import { card, eyebrow } from "@/lib/styles";

/** Shown instead of the app when the public env vars are not set yet. */
export default function SetupNotice({ missing }: { missing: string[] }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-6 px-5 py-16">
      <div>
        <p className={eyebrow}>AiOS SF · Lightning</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Almost there. Two keys to paste.
        </h1>
        <p className="mt-3 text-zinc-400">
          Set these environment variables, then redeploy. Full steps are in the
          README.
        </p>
      </div>

      <div className={card}>
        <ul className="space-y-2 font-mono text-sm">
          {missing.map((name) => (
            <li key={name} className="flex items-center gap-2 text-amber-300">
              <span aria-hidden>·</span>
              {name}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-zinc-500">
        These are read at build time, so redeploy after setting them.
      </p>
    </main>
  );
}
