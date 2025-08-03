// service/skills/skillsFetch.js
import { config } from "@/config";

export async function getSkills() {
  const res = await fetch(`${config.API_URL}/users/skills`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No se pudieron obtener las habilidades");
  }

  const response = await res.json();
  
  if (!response.success) {
    throw new Error("Error en la respuesta de habilidades");
  }

  // Retornar solo las habilidades con id y name
  return response.data.map(skill => ({
    id: skill.id,
    name: skill.name
  }));
}
