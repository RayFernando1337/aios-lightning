import ApplyEventPage from "@/components/ApplyEventPage";

export default async function EventApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ApplyEventPage slug={slug} />;
}
