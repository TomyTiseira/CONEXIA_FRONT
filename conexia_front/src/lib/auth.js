import { cookies } from 'next/headers';

export async function validateSession() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refreshToken');
  const accessToken = cookieStore.get('accessToken');

  return Boolean(accessToken || refreshToken);
}
