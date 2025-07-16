import { cookies } from 'next/headers';

export async function validateSession() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken');
  const refreshToken = cookieStore.get('refreshToken');

  return Boolean(accessToken || refreshToken);
}
