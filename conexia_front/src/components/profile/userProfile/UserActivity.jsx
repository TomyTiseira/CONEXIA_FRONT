import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import ActivityFeed from '@/components/activity/ActivityFeed';
import { getProfilePublications } from '@/service/publications/profilePublicationsFetch';

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

  if (loading && publications.length === 0) return <div className="text-center text-conexia-green mt-4">Cargando actividad...</div>;
  if (error) return <div className="text-center text-red-500 mt-4">{error}</div>;

  return <ActivityFeed publications={publications} isOwner={isOwner} userId={userId} />;
}

UserActivity.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isOwner: PropTypes.bool
};
