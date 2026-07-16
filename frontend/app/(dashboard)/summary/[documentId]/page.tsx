import { redirect } from 'next/navigation';

export default async function SummaryPage({
  params,
}: Readonly<{
  params: Promise<{ documentId: string }>;
}>) {
  const { documentId } = await params;
  redirect(`/analysis/${documentId}/summary`);
}
