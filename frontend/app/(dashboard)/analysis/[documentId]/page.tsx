import { redirect } from 'next/navigation';

export default async function AnalysisWorkspacePage({
  params,
}: Readonly<{
  params: Promise<{ documentId: string }>;
}>) {
  const { documentId } = await params;
  redirect(`/analysis/${documentId}/summary`);
}