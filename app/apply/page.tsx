import ApplyForm from "@/components/ApplyForm";
import SiteHeader from "@/components/SiteHeader";
import { MAX_SELECTED } from "@/convex/lib/limits";
import { eyebrow } from "@/lib/styles";

export const metadata = {
  title: "Apply · AiOS SF Lightning",
};

export default function ApplyPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl px-5 pt-8 pb-16">
        <p className={eyebrow}>Lightning slot</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Apply to demo tonight
        </h1>
        <p className="mt-3 text-zinc-300">
          {MAX_SELECTED} slots, two to three minutes each. Tell us what will be
          running on screen and what the room learns from it.
        </p>

        <div className="mt-8">
          <ApplyForm />
        </div>
      </main>
    </>
  );
}
