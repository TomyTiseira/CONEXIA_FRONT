// Página para ver los proyectos de un usuario específico
'use client';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MyProjectsView from '@/components/project/search/MyProjectsView';

export default function UserProjectsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  // Es dueño si el usuario logueado coincide con el id de la url
  const isOwner = user && String(user.id) === String(id);
  return <MyProjectsView userId={id} isOwner={isOwner} />;
}
