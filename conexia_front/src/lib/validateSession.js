import { cookies } from 'next/headers';

export async function validateSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;
  console.log('Access Token:', accessToken);
  console.log('Refresh Token:', refreshToken);

  console.log('Cookies en SSR:', cookieStore.getAll());
  return !!accessToken || !!refreshToken;
}
