// service/localities/localitiesFetch.js
import { config } from "@/config";

export async function getLocalities() {
  const res = await fetch(`${config.API_URL}/users/localities`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No se pudieron obtener las localidades");
  }

  const response = await res.json();
  if (!response.success) {
    throw new Error("Error en la respuesta de localidades");
  }

  // Retornar solo las localidades con id y name
  return response.data.map(loc => ({
    id: loc.id,
    name: loc.name
  }));
}
