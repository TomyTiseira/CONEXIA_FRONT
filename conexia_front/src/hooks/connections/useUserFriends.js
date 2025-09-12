import { useState, useEffect, useCallback } from 'react';
import { getUserFriends } from '@/service/connections/getUserFriends';

export function useUserFriends(userId, initialPage = 1, limit = 12) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState(null);

  // Fetch friends when page or userId changes
  useEffect(() => {
    if (!userId) return;
    const fetchFriends = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserFriends(userId, page, limit);
        setFriends(prev => page === 1 ? data.friends : [...prev, ...data.friends]);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message || 'Error al obtener amigos');
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [userId, page, limit]);

  // Reset friends when userId changes
  useEffect(() => {
    setFriends([]);
    setPage(initialPage);
    setPagination(null);
  }, [userId, initialPage]);

  const loadMore = () => {
    if (pagination?.hasNextPage && !loading) {
      setPage(prev => (pagination.nextPage ? pagination.nextPage : prev + 1));
    }
  };

  return { friends, loading, error, pagination, loadMore, page };
}
