import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  shopping: (projectId: string) => ['shopping', projectId] as const,
  jobs: ['jobs'] as const,
  job: (id: string) => ['jobs', id] as const,
  categories: ['categories'] as const,
} as const;
