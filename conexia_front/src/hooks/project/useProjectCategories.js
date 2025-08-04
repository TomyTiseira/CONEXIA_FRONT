import useFetchList from '@/hooks/common/useFetchList';
import { fetchProjectCategories } from '@/service/project/projectFetch';

export function useProjectCategories() {
  return useFetchList(fetchProjectCategories);
}
