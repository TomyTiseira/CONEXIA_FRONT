import useFetchList from '@/hooks/common/useFetchList';
import { fetchContractTypes } from '@/service/project/projectFetch';

export function useContractTypes() {
  return useFetchList(fetchContractTypes);
}