import { useState, useEffect, useCallback } from 'react';
import { getUserFriends } from '@/service/connections/getUserFriends';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/constants/roles';
import { useUserStore } from '@/store/userStore';

export function useUserFriends(userId, initialPage = 1, limit = 12) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState(null);
  const { user } = useAuth();
  const { roleName } = useUserStore();

  // Fetch friends when page or userId changes
  useEffect(() => {
    if (!userId) return;

    const fetchFriends = async () => {
      // No buscar amigos si no hay usuario o si es admin o moderador
      if (!user || roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR) {
        setFriends([]);
        setError(null);
        setLoading(false);
        setPagination(null);
        return;
      }

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

    // Solo ejecutar cuando user esté definido Y roleName esté cargado
    if (user !== null && roleName !== undefined) {
      fetchFriends();
    }
  }, [userId, page, limit, user, roleName]);

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
