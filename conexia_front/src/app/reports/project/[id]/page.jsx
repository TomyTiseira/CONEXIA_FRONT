
import NavbarModerator from '@/components/navbar/NavbarModerator';
import ProjectReportsGrid from '@/components/reports/ProjectReportsGrid';

export default function ProjectReportsPage({ params }) {
  const { id } = params;
  return (
    <>
      <NavbarModerator />
      <ProjectReportsGrid projectId={id} />
    </>
  );
}
