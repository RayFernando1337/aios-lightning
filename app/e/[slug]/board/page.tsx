import BoardEventPage from "@/components/BoardEventPage";

export default async function EventBoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BoardEventPage slug={slug} />;
}
