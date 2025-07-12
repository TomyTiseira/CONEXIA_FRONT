import { config } from "@/config";

export async function getProfileById(id) {
  const res = await fetch(`${config.API_URL}/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Si usás tokens, agregá: Authorization: `Bearer ${token}`
    },
    cache: "no-store", // importante para SSR
  });

  if (!res.ok) {
    throw new Error("No se pudo obtener el perfil");
  }

  return res.json();
}
