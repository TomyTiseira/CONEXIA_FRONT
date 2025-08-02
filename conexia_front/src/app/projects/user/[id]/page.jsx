// Página para ver los proyectos de un usuario específico
'use client';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MyProjectsView from '@/components/project/search/MyProjectsView';

export default function UserProjectsPage() {
  const { id } = useParams();
  return <MyProjectsView userId={id}/>;
}
