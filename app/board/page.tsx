import BoardList from "@/components/BoardList";
import SiteHeader from "@/components/SiteHeader";
import { EVENT } from "@/lib/content";
import { eyebrow } from "@/lib/styles";

export const metadata = {
  title: "Board · AiOS SF Lightning",
};

export default function BoardPage() {
  return (
    <>
      <SiteHeader />

      {/* Wider than the other pages: this one is read off a projector. */}
      <main className="mx-auto w-full max-w-3xl px-5 pt-8 pb-16">
        <p className={eyebrow}>{EVENT.when}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Tonight&apos;s board
        </h1>

        <div className="mt-6">
          <BoardList />
        </div>
      </main>
    </>
  );
}
