import useFetchList from '@/hooks/common/useFetchList';
import { fetchCollaborationTypes } from '@/service/project/projectFetch';

export function useCollaborationTypes() {
  return useFetchList(fetchCollaborationTypes);
}

