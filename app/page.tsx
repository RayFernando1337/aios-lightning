import { cookies } from "next/headers";
import ResolvedLanding from "@/components/ResolvedLanding";
import { LEADER_COOKIE } from "@/lib/leader";

export default async function Home() {
  const alreadyPlayed =
    (await cookies()).get(LEADER_COOKIE)?.value === "1";

  return <ResolvedLanding house alreadyPlayed={alreadyPlayed} />;
}
