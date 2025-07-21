'use client';
import { useState, useEffect } from 'react';
import { fetchInternalUsers } from '@/service/internalUser/internalUserFetch';

export default function useInternalUsers() {
  const [filters, setFilters] = useState({
    email: '',
    startDate: '',
    endDate: '',
    includeDeleted: false,
    page: 1,
    limit: 10,
  });

  const [data, setData] = useState({ users: [], hasNextPage: false, hasPreviousPage: false });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const result = await fetchInternalUsers(filters);
    console.log('result', result)
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  return {
    users: data.users,
    hasNextPage: data.hasNextPage,
    hasPreviousPage: data.hasPreviousPage,
    filters,
    setFilters,
    loading,
  };
}
