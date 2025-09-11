import PublicationReportsGrid from '@/components/admin/reports/PublicationReportsGrid';

export default function PublicationReportsPage({ params }) {
  const { id } = params;
  return <PublicationReportsGrid publicationId={id} />;
}
