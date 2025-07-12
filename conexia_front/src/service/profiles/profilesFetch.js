// service/profiles/profilesFetch.js
import { config } from "@/config";

export async function createUserProfile(formData) {
  const res = await fetch(`${config.API_URL}/users/profile`, {
    method: "POST",
    body: formData, // No usar headers para multipart/form-data
  });

  const response = await res.json();

  if (!res.ok) {
    throw new Error(response.message || "No se pudo crear el perfil");
  }

  return response;
}

export async function getDocumentTypes() {
  const res = await fetch(`${config.API_URL}/users/documentType`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("No se pudieron obtener los tipos de documento");
  }

  return res.json();
}