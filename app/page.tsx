import Link from "next/link";
import ApplyCta from "@/components/ApplyCta";
import SiteHeader from "@/components/SiteHeader";
import { MAX_SELECTED } from "@/convex/lib/limits";
import { EVENT, RULES } from "@/lib/content";
import { buttonSecondary, card, eyebrow } from "@/lib/styles";

const FLOW = [
  "Apply below. It takes about a minute.",
  `Hosts pick up to ${MAX_SELECTED} demos tonight.`,
  "Dry run with Ray before we start.",
  "Plug in, show it running, sit down.",
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-5 pt-10 pb-16">
        <p className={eyebrow}>
          {EVENT.when} · {EVENT.where}
        </p>
        <h1 className="mt-3 text-4xl leading-[1.05] font-black tracking-tight sm:text-6xl">
          AiOS SF <span className="text-amber-300">· Lightning</span>
        </h1>
        <p className="mt-4 text-lg text-zinc-300 sm:text-xl">
          {MAX_SELECTED} demos. Two to three minutes each. Working software
          only.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ApplyCta />
          <Link href="/board" className={buttonSecondary}>
            See tonight&apos;s board
          </Link>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            The rules
          </h2>
          <ol className="mt-4 space-y-3">
            {RULES.map((rule, index) => (
              <li key={rule.title} className={`${card} flex gap-4`}>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-sm font-bold text-amber-300">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-zinc-50">{rule.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{rule.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded-2xl border border-amber-300/25 bg-amber-300/[0.07] p-5 sm:p-6">
          <p className={eyebrow}>Dry run gate</p>
          <p className="mt-2 text-zinc-200">{EVENT.dryRun}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            How tonight works
          </h2>
          <ol className="mt-4 space-y-2 text-zinc-300">
            {FLOW.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="font-mono text-sm text-amber-300/80">
                  {index + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ApplyCta />
          <p className="text-sm text-zinc-500">
            Slots close when the {MAX_SELECTED} are picked.
          </p>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-3xl px-5 pb-10 text-sm text-zinc-500">
        {EVENT.brand}. Hosted at {EVENT.where}.
      </footer>
    </>
  );
}
