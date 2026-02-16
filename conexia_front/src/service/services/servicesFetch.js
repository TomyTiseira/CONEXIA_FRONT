import { config } from "@/config";

/**
 * Crear un nuevo servicio
 * @param {Object} payload - Datos del servicio (JSON con imageFiles en base64)
 * @returns {Promise<Object>} Respuesta del servicio creado
 */
export async function createService(payload) {
  const res = await fetch(`${config.API_URL}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Error al crear el servicio");
  }

  return json;
}

/**
 * Obtener categorías de servicios
 * @returns {Promise<Object>} Lista de categorías
 */
export async function fetchServiceCategories() {
  const res = await fetch(`${config.API_URL}/services/categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No se pudieron obtener las categorías de servicios");
  }

  const response = await res.json();

  if (!response.success) {
    throw new Error("Error en la respuesta de categorías de servicios");
  }

  // La respuesta tiene la estructura: { success: true, data: { categories: [...] } }
  return response.data.categories;
}

/**
 * Obtener servicios con filtros y paginación
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Página actual
 * @param {number} limit - Límite de resultados por página
 * @returns {Promise<Object>} Lista de servicios con paginación
 */
export async function fetchServices(filters = {}) {
  const {
    search,
    categoryIds,
    minRating,
    page = 1,
    limit = 12,
    includeInactive = false,
  } = filters;

  const params = new URLSearchParams();

  // Usar los nombres de parámetros que espera el backend
  if (search) params.append("search", search);
  if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
    // Repetimos la key 'categoryIds' para cada valor.
    // Si sólo hay un valor, lo duplicamos para forzar array en parsers simples.
    const ids = categoryIds.map((id) => id.toString());
    const toSend = ids.length === 1 ? [ids[0], ids[0]] : ids;
    toSend.forEach((id) => params.append("categoryIds", id));
  }
  if (minRating !== undefined && minRating !== null) {
    params.append("minRating", minRating.toString());
  }
  if (includeInactive) params.append("includeInactive", "true");

  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const res = await fetch(`${config.API_URL}/services?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  // Manejo tolerante: si backend devuelve 204 (sin contenido) o 404 para combinaciones sin resultados,
  // devolvemos una estructura vacía en lugar de lanzar error.
  if (res.status === 204) {
    return {
      services: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  // Intenta parsear JSON incluso si !ok para ver si hay payload utilizable
  let responseJson = null;
  try {
    responseJson = await res.json();
  } catch (_) {
    // Si no hay body y no es ok salvo 204, retorna vacío controlado
    if (!res.ok) {
      return {
        services: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  if (!res.ok) {
    // Si backend responde con success=false pero con data vacía, no lo tratamos como error fatal
    if (
      responseJson &&
      responseJson.success === false &&
      (!responseJson.data || !responseJson.data.services)
    ) {
      return {
        services: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
    throw new Error(
      responseJson?.message || "No se pudieron obtener los servicios",
    );
  }

  const response = responseJson ?? { success: true, data: null };

  if (!response.success) {
    // Mismo criterio: si success=false pero sin datos, devolvemos vacío
    return {
      services: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  return (
    response.data ?? {
      services: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    }
  );
}

/**
 * Obtener servicios de un usuario específico
 * @param {number} userId - ID del usuario
 * @param {Object} filters - Filtros adicionales
 * @returns {Promise<Object>} Lista de servicios del usuario con paginación
 */
export async function fetchUserServices(userId, filters = {}) {
  const { page = 1, limit = 12, includeInactive = false } = filters;

  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (includeInactive) params.append("includeInactive", "true");

  const res = await fetch(
    `${config.API_URL}/services/profile/${userId}?${params.toString()}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error("No se pudieron obtener los servicios del usuario");
  }

  const response = await res.json();

  if (!response.success) {
    throw new Error("Error en la respuesta de servicios del usuario");
  }

  return response.data;
}

/**
 * Obtener detalle de un servicio específico
 * @param {number} serviceId - ID del servicio
 * @returns {Promise<Object>} Detalle del servicio
 */
export async function fetchServiceDetail(serviceId) {
  const res = await fetch(`${config.API_URL}/services/${serviceId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No se pudo obtener el detalle del servicio");
  }

  const response = await res.json();

  if (!response.success) {
    throw new Error("Error en la respuesta del detalle del servicio");
  }

  return response.data;
}

/**
 * Editar un servicio existente
 * @param {number} serviceId - ID del servicio
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Servicio actualizado
 */
export async function updateService(serviceId, data) {
  const res = await fetch(`${config.API_URL}/services/${serviceId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Error al actualizar el servicio");
  }

  return json;
}

/**
 * Eliminar un servicio
 * @param {number} serviceId - ID del servicio
 * @param {string} reason - Motivo de eliminación
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export async function deleteService(serviceId, reason) {
  const res = await fetch(`${config.API_URL}/services/${serviceId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reason }),
  });

  const json = await res.json();

  if (!res.ok) {
    // Crear un error personalizado para el caso de conflicto (409)
    const error = new Error(json?.message || "Error al eliminar el servicio");
    error.statusCode = res.status;
    error.status = json?.status;
    throw error;
  }

  return json;
}

export async function fetchServiceDetail(serviceId) {
  const res = await fetch(`${config.API_URL}/services/${serviceId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No se pudo obtener el detalle del servicio");
  }

  const response = await res.json();

  if (!response.success) {
    throw new Error("Error en la respuesta del detalle del servicio");
  }

  return response.data;
}

/**
 * Editar un servicio existente
 * @param {number} serviceId - ID del servicio
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Servicio actualizado
 */
export async function updateService(serviceId, data) {
  const res = await fetch(`${config.API_URL}/services/${serviceId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Error al actualizar el servicio");
  }

  return json;
}

/**
 * Eliminar un servicio
 * @param {number} serviceId - ID del servicio
 * @param {string} reason - Motivo de eliminación
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export async function deleteService(serviceId, reason) {
  const res = await fetch(`${config.API_URL}/services/${serviceId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reason }),
  });

  const json = await res.json();

  if (!res.ok) {
    // Crear un error personalizado para el caso de conflicto (409)
    const error = new Error(json?.message || "Error al eliminar el servicio");
    error.statusCode = res.status;
    error.status = json?.status;
    throw error;
  }

  return json;
}
