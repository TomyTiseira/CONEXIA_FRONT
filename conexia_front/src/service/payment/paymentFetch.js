// Editar alias y customName de una cuenta
export async function editAccountAliasAndName(id, { alias, customName }) {
  const body = {};
  if (alias !== undefined) body.alias = alias;
  if (customName !== undefined) body.customName = customName;
  const res = await fetchWithRefresh(`${config.API_URL}/payment-accounts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  const response = await res.json();
  if (!res.ok) {
    // Traducir mensajes comunes del backend
    let errorMessage = response.message || 'Error al editar datos de la cuenta';
    
    // Limpiar mensajes mezclados del backend
    if (errorMessage.includes('already exists') || errorMessage.includes('Ya tienes')) {
      if (errorMessage.toLowerCase().includes('alias')) {
        errorMessage = 'Ya tienes otra cuenta registrada con este alias';
      } else {
        errorMessage = 'Ya existe una cuenta con estos datos';
      }
    }
    
    throw new Error(errorMessage);
  }
  return response.data;
}
import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

export async function fetchBanks() {
  const res = await fetch(`${config.API_URL}/payment-accounts/banks`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener bancos');
  const response = await res.json();
  return response.data;
}

export async function fetchDigitalPlatforms() {
  const res = await fetch(`${config.API_URL}/payment-accounts/digital-platforms`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener plataformas digitales');
  const response = await res.json();
  return response.data;
}

export async function addBankAccount({ bankId, bankAccountType, cbu, accountHolderName, cuilCuit, alias, customName }) {
  const body = {
    bankId,
    bankAccountType,
    cbu,
    accountHolderName,
    cuilCuit
  };
  if (alias) body.alias = alias;
  // No enviar cardName, solo customName
  if (customName) body.customName = customName;
  const res = await fetchWithRefresh(`${config.API_URL}/payment-accounts/bank-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  const response = await res.json();
  if (!res.ok) {
    // Traducir mensajes comunes del backend
    let errorMessage = response.message || 'Error al registrar cuenta bancaria';
    
    // Limpiar mensajes mezclados del backend
    if (errorMessage.includes('already exists') || errorMessage.includes('Ya tienes una cuenta')) {
      // Casos específicos basados en el contenido del mensaje
      if (errorMessage.toLowerCase().includes('cbu')) {
        errorMessage = 'Ya existe una cuenta registrada con este número de CBU';
      } else if (errorMessage.toLowerCase().includes('alias')) {
        errorMessage = 'Ya tienes una cuenta registrada con este alias';
      } else {
        errorMessage = 'Ya tienes una cuenta bancaria registrada con estos datos';
      }
    }
    
    // No lanzar excepción; devolver objeto con error para que el caller decida cómo mostrarlo
    return { error: true, message: errorMessage };
  }
  return response.data;
}

export async function addDigitalAccount({ digitalPlatformId, cvu, accountHolderName, cuilCuit, alias, customName }) {
  const body = {
    digitalPlatformId,
    cvu,
    accountHolderName,
    cuilCuit
  };
  if (alias) body.alias = alias;
  // No enviar cardName, solo customName
  if (customName) body.customName = customName;
  const res = await fetchWithRefresh(`${config.API_URL}/payment-accounts/digital-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  const response = await res.json();
  if (!res.ok) {
    // Traducir mensajes comunes del backend
    let errorMessage = response.message || 'Error al registrar cuenta digital';
    
    // Limpiar mensajes mezclados del backend
    if (errorMessage.includes('already exists') || errorMessage.includes('Ya tienes una cuenta')) {
      // Casos específicos basados en el contenido del mensaje
      if (errorMessage.toLowerCase().includes('cvu') || errorMessage.toLowerCase().includes('cbu')) {
        errorMessage = 'Ya existe una cuenta registrada con este número de CVU/CBU';
      } else if (errorMessage.toLowerCase().includes('alias')) {
        errorMessage = 'Ya tienes una cuenta registrada con este alias';
      } else {
        errorMessage = 'Ya tienes una cuenta digital registrada con estos datos';
      }
    }
    
    // No lanzar excepción; devolver objeto con error para que el caller decida cómo mostrarlo
    return { error: true, message: errorMessage };
  }
  return response.data;
}

export async function fetchPaymentAccounts() {
  const res = await fetchWithRefresh(`${config.API_URL}/payment-accounts`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al obtener cuentas');
  return response.data;
}

export async function fetchBankAccountById(id) {
  const res = await fetchWithRefresh(`${config.API_URL}/payment-accounts/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al obtener detalle de cuenta');
  return response.data;
}

export async function deleteBankAccount(id) {
  const res = await fetchWithRefresh(`${config.API_URL}/payment-accounts/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al eliminar cuenta');
  return response;
}
