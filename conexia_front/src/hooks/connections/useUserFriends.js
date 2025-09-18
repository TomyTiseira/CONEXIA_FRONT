import { useState, useEffect, useCallback } from 'react';
import { getUserFriends } from '@/service/connections/getUserFriends';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/constants/roles';

export function useUserFriends(userId, initialPage = 1, limit = 12) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState(null);
  const { user } = useAuth();

  // Fetch friends when page or userId changes
  useEffect(() => {
    if (!userId) return;
    
    const fetchFriends = async () => {
      // No buscar amigos si no hay usuario o si es admin o moderador
      if (!user || user.role === ROLES.ADMIN || user.role === ROLES.MODERATOR) {
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
    
    // Solo ejecutar cuando user esté definido Y tenga la propiedad role cargada
    if (user !== null && user.role !== undefined) {
      fetchFriends();
    }
  }, [userId, page, limit, user]); // Agregar user como dependencia

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
