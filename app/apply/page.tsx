import ApplyForm from "@/components/ApplyForm";
import SiteHeader from "@/components/SiteHeader";
import { MAX_SELECTED } from "@/convex/lib/limits";
import { eyebrow, pageMain } from "@/lib/styles";

export const metadata = {
  title: "Apply · AiOS SF Lightning",
};

export default function ApplyPage() {
  return (
    <>
      <SiteHeader />

      <main className={pageMain}>
        <p className={eyebrow}>01 · Lightning slot</p>
        <h1 className="font-display mt-3 text-5xl tracking-[-0.035em] sm:text-7xl">
          APPLY TO DEMO TONIGHT
        </h1>
        <p className="mt-4 max-w-xl text-cream/85">
          {MAX_SELECTED} slots, two to three minutes each. Tell us what will be
          running on screen and what the room learns from it.
        </p>

        <div className="mt-10">
          <ApplyForm />
        </div>
      </main>
    </>
  );
}
