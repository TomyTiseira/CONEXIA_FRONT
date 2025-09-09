import { useConnectionRequestsContext } from '@/context/ConnectionRequestsContext';

export function useConnectionRequests() {
  // Utilizamos el contexto en lugar de la lógica local
  return useConnectionRequestsContext();
}
