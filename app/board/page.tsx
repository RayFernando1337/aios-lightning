import BoardList from "@/components/BoardList";
import SiteHeader from "@/components/SiteHeader";
import { EVENT } from "@/lib/content";
import { eyebrow, pageMain } from "@/lib/styles";

export const metadata = {
  title: "Board · AiOS SF Lightning",
};

export default function BoardPage() {
  return (
    <>
      <SiteHeader />

      <main className={`${pageMain} max-w-4xl`}>
        <p className={eyebrow}>{EVENT.when}</p>
        <h1 className="font-display mt-3 text-5xl tracking-[-0.035em] sm:text-7xl">
          TONIGHT&apos;S BOARD
        </h1>

        <div className="mt-10">
          <BoardList />
        </div>
      </main>
    </>
  );
}
