'use client';

import { useEffect, useState } from 'react';
import { getInternalUserRoles } from '@/service/internalUser/internalUserFetch';

export function useInternalRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInternalUserRoles()
      .then((res) =>
        setRoles(res.data)
      )
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  return { roles, loading };
}
