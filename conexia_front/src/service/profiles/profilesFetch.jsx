import { config } from "@/config";

export async function getProfileById(id) {
  const res = await fetch(`${config.API_URL}/users/profile/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No se pudo obtener el perfil");
  }

  return res.json();
}

