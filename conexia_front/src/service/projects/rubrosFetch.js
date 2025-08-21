// service/projects/rubrosFetch.js
import { config } from "@/config";

export async function getRubros() {
  const res = await fetch(`${config.API_URL}/projects/rubros`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No se pudieron obtener los rubros");
  }

  const response = await res.json();
  if (!response.success) {
    throw new Error("Error en la respuesta de rubros");
  }
  return response.data.map(rubro => ({
    id: rubro.id,
    name: rubro.name
  }));
}

export async function getSkillsByRubro(rubroId) {
  const res = await fetch(`${config.API_URL}/projects/skills/rubro/${rubroId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No se pudieron obtener las habilidades del rubro");
  }

  const response = await res.json();
  if (!response.success) {
    throw new Error("Error en la respuesta de habilidades por rubro");
  }
  return response.data.map(skill => ({
    id: skill.id,
    name: skill.name,
    rubroId: skill.rubroId
  }));
}
