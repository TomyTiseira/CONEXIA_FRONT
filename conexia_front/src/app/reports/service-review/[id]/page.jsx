'use client';

import { use } from 'react';
import ServiceReviewReportsDetail from '@/components/admin/reports/ServiceReviewReportsDetail';

export default function ServiceReviewReportDetailPage({ params }) {
  const { id } = use(params);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ServiceReviewReportsDetail serviceReviewId={id} />
    </div>
  );
}
