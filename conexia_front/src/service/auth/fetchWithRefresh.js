import { refreshToken } from "./authService";

export async function fetchWithRefresh(url, options = {}, retries = 1) {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    if (res.status === 401 && retries > 0) {
      await refreshToken(); // intentá refrescar el token
      return fetchWithRefresh(url, options, retries - 1); // retry original request
    }

    return res;
  } catch (err) {
    throw new Error("Error en la autenticación");
  }
}
