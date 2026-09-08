import { cookies } from "next/headers";
import ResolvedLanding from "@/components/ResolvedLanding";
import { LEADER_COOKIE } from "@/lib/leader";

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const alreadyPlayed =
    (await cookies()).get(LEADER_COOKIE)?.value === "1";

  return (
    <ResolvedLanding slug={slug} house={false} alreadyPlayed={alreadyPlayed} />
  );
}
