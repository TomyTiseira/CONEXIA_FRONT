import { config } from '@/config';

export async function fetchInternalUsers(filters) {
    const params = new URLSearchParams();

    if (filters.email) params.append('email', filters.email);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.includeDeleted) params.append('includeDeleted', 'true');

    params.append('page', filters.page);
    params.append('limit', filters.limit);

    const res = await fetch(`${config.API_URL}/internal-users?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Error al cargar usuarios internos');

    const json = await res.json();

    return {
      users: json.data.users,
      hasNextPage: json.data.pagination.hasNextPage,
      hasPreviousPage: json.data.pagination.hasPreviousPage,
    };
}

export async function getInternalUserRoles() {
  const res = await fetch(`${config.API_URL}/internal-users/roles`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener roles');
  }

  return res.json();
}

export async function createInternalUser(data) {
  const res = await fetch(`${config.API_URL}/internal-users`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear usuario');
  }

  return res.json();
}
