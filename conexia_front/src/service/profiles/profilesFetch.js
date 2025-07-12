// service/profiles/profilesFetch.js
import { config } from "@/config";

export async function createUserProfile(userId, formData) {
  const res = await fetch(`${config.API_URL}/users/${userId}/profile`, {
    method: "POST",
    body: formData,
  });

  const response = await res.json();

  if (!res.ok) {
    throw new Error(response.message || "Error al crear perfil");
  }

  return response;
}

export async function getDocumentTypes() {
  const res = await fetch(`${config.API_URL}/users/document-types`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("No se pudieron obtener los tipos de documento");
  }

  return res.json();
}