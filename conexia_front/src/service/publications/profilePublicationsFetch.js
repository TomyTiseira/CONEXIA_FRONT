import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

export async function getProfilePublications(userId) {
  if (!userId) throw new Error('userId is required');
  const url = `${config.API_URL}/publications/profile/${userId}`;
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error fetching profile publications');
  return res.json();
}
