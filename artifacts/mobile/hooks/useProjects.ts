import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Project } from '@/types/domain';
import { projectsRepo } from '@/db/repositories/projects.repo';
import { queryKeys } from '@/lib/query-client';
import { captureError } from '@/lib/sentry';

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => projectsRepo.findAll(),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.project(id ?? ''),
    queryFn: () => projectsRepo.findById(id!),
    enabled: Boolean(id),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) =>
      projectsRepo.upsert(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
    },
    onError: (err) => captureError(err, { context: 'useCreateProject' }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (project: Project) => projectsRepo.update(project),
    onSuccess: (_data, project) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
      qc.invalidateQueries({ queryKey: queryKeys.project(project.id) });
    },
    onError: (err) => captureError(err, { context: 'useUpdateProject' }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsRepo.delete(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
      qc.removeQueries({ queryKey: queryKeys.project(id) });
    },
    onError: (err) => captureError(err, { context: 'useDeleteProject' }),
  });
}

export function useUpdateProjectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      project,
      status,
    }: {
      project: Project;
      status: Project['status'];
    }) => projectsRepo.update({ ...project, status }),
    onSuccess: (_data, { project }) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
      qc.invalidateQueries({ queryKey: queryKeys.project(project.id) });
    },
  });
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

export function useProjectStats(projects: Project[] | undefined) {
  if (!projects) return { total: 0, active: 0, completed: 0 };
  return {
    total:     projects.length,
    active:    projects.filter((p) => p.status === 'in-progress').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  };
}
