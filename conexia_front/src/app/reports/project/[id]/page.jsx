
import Navbar from '@/components/navbar/Navbar';
import ProjectReportsGrid from '@/components/reports/ProjectReportsGrid';

export default async function ProjectReportsPage({ params }) {
  const { id } = params;
  return (
    <>
      <Navbar />
      <ProjectReportsGrid projectId={id} />
    </>
  );
}
