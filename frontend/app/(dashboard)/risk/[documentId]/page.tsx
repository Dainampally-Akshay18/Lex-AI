import { redirect } from 'next/navigation';

export default async function RiskAnalysisPage({
  params,
}: Readonly<{
  params: Promise<{ documentId: string }>;
}>) {
  const { documentId } = await params;
  redirect(`/analysis/${documentId}/risk`);
}
