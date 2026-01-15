// service/profiles/profilesFetch.js
import { config } from "@/config";

export async function createUserProfile(formData) {
  // Usar POST - El backend detecta si hay perfil vacío y lo actualiza automáticamente
  const res = await fetch(`${config.API_URL}/users/profile`, {
    method: "POST",
    body: formData,
    credentials: "include", // importante para que se mande la cookie con el JWT
  });

  const response = await res.json();

  if (!res.ok) {
    // Crear un error más simple y robusto
    const errorMessage = response.message || "Error al crear perfil";
    const customError = {
      message: errorMessage,
      status: res.status,
      response: response,
      name: 'ProfileError',
      toString: () => errorMessage
    };
    
    throw customError;
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

  const data = await res.json();
  
  // Asegurar que los campos de moderación existan en la respuesta
  if (data.data) {
    data.data.isBanned = data.data.isBanned || false;
    data.data.isSuspended = data.data.isSuspended || false;
    data.data.suspensionExpiresAt = data.data.suspensionExpiresAt || null;
  }
  
  return data;
}
