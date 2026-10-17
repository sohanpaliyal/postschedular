import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPostsStore } from '@/services';

export function usePosts() {
  const [repository] = useState(createPostsStore);
  const state = useSyncExternalStore(repository.subscribe, repository.getSnapshot);
  useEffect(() => {
    void repository.load();
    return repository.cancel;
  }, [repository]);
  return { ...state, repository };
}
