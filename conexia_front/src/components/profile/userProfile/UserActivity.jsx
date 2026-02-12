import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import ActivityFeed from '@/components/activity/ActivityFeed';
import { getProfilePublications } from '@/service/publications/profilePublicationsFetch';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function UserActivity({ userId, isOwner }) {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const fetchPublications = useCallback(async (reset = false) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getProfilePublications(userId, page, limit);
      const data = Array.isArray(res.data?.publications) ? res.data.publications : [];
      setPublications(prev => reset ? data : [...prev, ...data]);
      setHasMore(res.data?.pagination?.hasNextPage ?? false);
    } catch (err) {
      setError('Error al cargar la actividad');
    } finally {
      setLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    setPage(1);
    setPublications([]);
    setHasMore(true);
  }, [userId]);

  useEffect(() => {
    fetchPublications(page === 1);
    // eslint-disable-next-line
  }, [page, userId]);

  const handleLoadMore = () => {
    if (!loading && hasMore) setPage(prev => prev + 1);
  };

  // Callback para manejar cuando se elimina una publicación
  const handlePublicationDeleted = (deletedPublicationId) => {
    setPublications(prev => prev.filter(pub => pub.id !== deletedPublicationId));
  };

  // No mostrar nada mientras carga o si hay error
  if (loading && publications.length === 0) return null;
  if (error) return null;
  
  // No mostrar la sección si no hay publicaciones
  if (publications.length === 0) return null;

  return <ActivityFeed publications={publications} isOwner={isOwner} userId={userId} onPublicationDeleted={handlePublicationDeleted} />;
}

UserActivity.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isOwner: PropTypes.bool
};
