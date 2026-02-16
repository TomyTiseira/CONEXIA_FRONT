import { config } from "@/config";

export async function fetchProjectCategories() {
  const res = await fetch(`${config.API_URL}/projects/categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("No se pudieron obtener las categorías");
  const response = await res.json();
  if (!response.success) throw new Error("Error en la respuesta de categorías");
  return response.data;
}

export async function fetchCollaborationTypes() {
  const res = await fetch(`${config.API_URL}/projects/collaboration-types`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok)
    throw new Error("No se pudieron obtener los tipos de colaboración");
  const response = await res.json();
  if (!response.success)
    throw new Error("Error en la respuesta de tipos de colaboración");
  return response.data;
}

export async function fetchContractTypes() {
  const res = await fetch(`${config.API_URL}/projects/contract-types`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("No se pudieron obtener los tipos de contrato");
  const response = await res.json();
  if (!response.success)
    throw new Error("Error en la respuesta de tipos de contrato");
  return response.data;
}

export async function fetchApplicationTypes() {
  const res = await fetch(`${config.API_URL}/projects/application-types`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok)
    throw new Error("No se pudieron obtener los tipos de postulación");
  const response = await res.json();
  if (!response.success)
    throw new Error("Error en la respuesta de tipos de postulación");
  return response.data;
}

export async function createProject(projectData) {
  let res;
  try {
    res = await fetch(`${config.API_URL}/projects/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(projectData),
    });
  } catch (networkError) {
    console.error("❌ Error de red:", networkError);
    throw new Error(`Error de conexión: ${networkError.message}`);
  }

  let responseText;
  try {
    responseText = await res.text();
  } catch (textError) {
    throw new Error(`Error al leer respuesta del servidor (${res.status})`);
  }

  let json;
  try {
    json = JSON.parse(responseText);
  } catch (parseError) {
    throw new Error(
      `Error del servidor: ${res.status} ${res.statusText}. Respuesta: ${responseText.substring(0, 200)}`,
    );
  }

  if (!res.ok) {
    let errorMessage = "Error al crear el proyecto";
    let errorDetails = "";

    if (json?.message) {
      errorMessage = json.message;
    } else if (json?.error) {
      errorMessage = json.error;
    } else if (json?.errors && Array.isArray(json.errors)) {
      errorDetails = json.errors
        .map((e) =>
          typeof e === "string" ? e : e.message || JSON.stringify(e),
        )
        .join(", ");
      errorMessage = errorDetails || "Errores de validación del backend";
    } else if (json?.errors && typeof json.errors === "object") {
      errorDetails = Object.entries(json.errors)
        .map(
          ([field, msgs]) =>
            `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`,
        )
        .join(" | ");
      errorMessage = errorDetails || "Error de validación";
    }

    const fullError = errorDetails
      ? `${errorMessage} - ${errorDetails}`
      : errorMessage;
    throw new Error(`${fullError} (${res.status})`);
  }

  return json;
}

export async function deleteProjectById(projectId, motivo) {
  try {
    const res = await fetch(`${config.API_URL}/projects/${projectId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reason: motivo }),
    });

    if (!res.ok) {
      let errorMessage = "Error al eliminar el proyecto";
      try {
        const errorData = await res.json();
        errorMessage =
          errorData.message ||
          errorData.error ||
          `Error ${res.status}: ${res.statusText}`;
      } catch (parseError) {
        errorMessage = `Error ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      return data;
    }

    return { success: true, message: "Proyecto eliminado correctamente" };
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener estadísticas y evaluaciones de postulaciones de un proyecto
 * @param {number} projectId - ID del proyecto
 * @returns {Promise<ProjectStatisticsResponse>}
 */
export async function getProjectStatistics(projectId) {
  try {
    const res = await fetch(
      `${config.API_URL}/projects/${projectId}/statistics`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    );

    if (!res.ok) {
      if (res.status === 403) {
        throw new Error(
          "No tienes permisos para ver las estadísticas de este proyecto",
        );
      }
      if (res.status === 404) {
        throw new Error("Proyecto no encontrado");
      }

      let errorMessage = "Error al obtener estadísticas del proyecto";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `Error ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || "Error en la respuesta del servidor");
    }

    return data;
  } catch (error) {
    throw error;
  }
}
