import { redirect } from 'next/navigation';

export default async function FinancialPage({
  params,
}: Readonly<{
  params: Promise<{ documentId: string }>;
}>) {
  const { documentId } = await params;
  redirect(`/analysis/${documentId}/financial`);
}
