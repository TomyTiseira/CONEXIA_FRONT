import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ActivityFeed from '@/components/activity/ActivityFeed';
import { getProfilePublications } from '@/service/publications/profilePublicationsFetch';

export default function UserActivity({ userId, isOwner }) {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    getProfilePublications(userId)
      .then(res => setPublications(res.data || []))
      .catch(err => setError('Error al cargar la actividad'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="text-center text-conexia-green mt-4">Cargando actividad...</div>;
  if (error) return <div className="text-center text-red-500 mt-4">{error}</div>;

  return <ActivityFeed publications={publications} isOwner={isOwner} />;
}

UserActivity.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isOwner: PropTypes.bool
};
