// src/hooks/common/useFetchList.js
import { useState, useEffect } from 'react';

export default function useFetchList(fetchFunction) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFunction()
      .then(res => setData(res.map(item => ({ id: item.id, name: item.name }))))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [fetchFunction]);

  return { data, loading, error };
}
